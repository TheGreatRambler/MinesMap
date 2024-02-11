package main

import (
	"log"
	"net/http"
	"regexp"
	"io"
	"time"
	"fmt"
	"bytes"
	"encoding/json"

	"github.com/rs/cors"
	"github.com/andybalholm/brotli"
	"github.com/gorilla/websocket"
)

// Port we listen on.
const portNum string = ":3001"

type Server struct {
	HttpClient    http.Client
	HomepageRegex *regexp.Regexp
}

// Note: Much of this was created with asssitance from GitHub Copilot Autocompletion and Chat.

// Event server
func (s *Server) GetEvents(w http.ResponseWriter, r *http.Request) {

	// Get today's date range 
	// Get the current time in the fomrat desired by EMS.
	now := time.Now()
	start := now.Format("2006-01-02") + " 00:00:00"
	nextDay := now.AddDate(0, 0, 1)
	end := nextDay.Format("2006-01-02") + " 00:00:00"


	// Events must be filtered by their building code (e.g. "MC") and room number (e.g. "218").
	buildingCode := r.URL.Query().Get("buildingCode")
	roomNumber := r.URL.Query().Get("roomNumber")

	// This is a public anonymous API, but should still be pinged sparingly since we don't know
	// if this is intended use. In the case that this is forbidden API use, we would have to switch
	// to another data source.
	postBody := `{"filterData":{"filters":[{"filterName":"StartDate","value":"` + start + `","displayValue":3,"filterType":3},{"filterName":"EndDate","value":"` + end + `","filterType":3,"displayValue":""},{"filterName":"TimeZone","value":"102","displayValue":"","filterType":2},{"filterName":"RollupEventsToReservation","value":"false","displayValue":""},{"filterName":"ResultType","value":"Daily","displayValue":""}]}}`;

	elevation_req, err := http.NewRequest("POST", fmt.Sprintf("https://mines.emscloudservice.com/web/AnonymousServersApi.aspx/BrowseEvents"), bytes.NewBuffer([]byte(postBody)))
	if err != nil {
		w.WriteHeader(500)
		return
	}

	elevation_req.Header.Set("Host", "mines.emscloudservice.com")
	elevation_req.Header.Set("User-Agent", "Mozilla/5.0 (X11; Linux x86_64; rv:122.0) Gecko/20100101 Firefox/122.0")
	elevation_req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8")
	elevation_req.Header.Set("Accept-Language", "en-US,en;q=0.5")
	elevation_req.Header.Set("Accept-Encoding", "gzip, deflate, br")
	elevation_req.Header.Set("Content-Type", "application/json; charset=utf-8")
	elevation_req.Header.Set("Content-Length", "417")
	elevation_req.Header.Set("Origin", "null")
	elevation_req.Header.Set("DNT", "1")
	elevation_req.Header.Set("Connection", "keep-alive")
	elevation_req.Header.Set("Upgrade-Insecure-Requests", "1")
	elevation_req.Header.Set("Sec-Fetch-Dest", "document")
	elevation_req.Header.Set("Sec-Fetch-Mode", "navigate")
	elevation_req.Header.Set("Sec-Fetch-Site", "cross-site")

	res, err := s.HttpClient.Do(elevation_req)
	if err != nil {
		w.WriteHeader(500)
		return
	}

	body, err := io.ReadAll(res.Body)
	if err != nil {
		w.WriteHeader(500)
		return
	}

	// API will return a payload compressed with Brotli.
	brReader := brotli.NewReader(bytes.NewReader(body))
	jsonDecoder := json.NewDecoder(brReader)

	// Payload for some reason has a JSON object with a single "d" field containing an escaped string of JSON.
	// We'll unmarshal the "d" field to get the actual JSON, and then unmarshal that to get the data we want.
	var data map[string]interface{}
	err = jsonDecoder.Decode(&data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	dValue, ok := data["d"].(string)
	if !ok {
		http.Error(w, "Invalid data format", http.StatusInternalServerError)
		return
	}

	var jsonData map[string]interface{}
	err = json.Unmarshal([]byte(dValue), &jsonData)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Filter the data to the building and room number we want. Currently we just check the daily
	// events since that's what is available.
	var filteredEvents []interface{}
	for _, event := range jsonData["DailyBookingResults"].([]interface{}) {
		eventMap := event.(map[string]interface{})
		if eventMap["Building"] == buildingCode && eventMap["RoomCode"] == roomNumber {
			// PRint the new json string
			// newwJsonData, err := json.Marshal(eventMap)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			filteredEvents = append(filteredEvents, event)
		}
	}

	// Remove all but the EventName, GroupName, TimeBookingStart, and TimeBookingEnd fields
	// to reduce the size of the response. We don't need the other fields. Note that we rename
	// these to fields that are more idiomatic in JavaScript.
	var strippedEvents []map[string]interface{}
	for _, event := range filteredEvents {
		eventMap := event.(map[string]interface{})
		strippedEvent := map[string]interface{}{
			"name": eventMap["EventName"],
			"group": eventMap["GroupName"],
			"startTime": eventMap["TimeBookingStart"],
			"endTime": eventMap["TimeBookingEnd"],
		}
		strippedEvents = append(strippedEvents, strippedEvent)
	}

	// Marshal the stripped events to a new json string and send it to the client.
	newJsonData, err := json.Marshal(strippedEvents)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_, err = w.Write([]byte(newJsonData))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

// Creating this system was heavily assisted by GitHub Copilot Chat.

var upgrader = websocket.Upgrader{
	// Default recommended buffer sizes chosen by copilot.
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	// Allow all origins for speed of development. In practice this should/could be more restrictive.
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// Effectively, what we want to do is to connect the mobile controllerand the web interface via the
// server's websocket. The mobile controller will send messages to the server, and the server will
// broadcast those messages to the web interface. To do this, we merely forward all incoming messages
// to the websocket being written to the websocket being written. 
var messages = make(chan []byte)

func (s *Server) handleGestureWrite(w http.ResponseWriter, r *http.Request) {
    conn, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        log.Println(err)
        return
    }
    defer conn.Close()

    for {
				// All data from our websocket will be sent to the messages channel
				// asyncrhonously.
        _, message, err := conn.ReadMessage()
        if err != nil {
            log.Println("read:", err)
            break
        }
        log.Printf("received: %s", message)
        messages <- message
    }
}

func (s *Server) handleGestureRead(w http.ResponseWriter, r *http.Request) {
    conn, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        log.Println(err)
        return
    }
    defer conn.Close()

    for {
        // Read message sent by write websocket, forward it to our websocket.
        message := <-messages
        err = conn.WriteMessage(websocket.TextMessage, message)
        if err != nil {
            log.Println("write:", err)
            break
        }
    }
}

func main() {
	s := &Server{
		HttpClient:    http.Client{},
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/events", s.GetEvents)
	mux.HandleFunc("/gestures/read", s.handleGestureRead)
	mux.HandleFunc("/gestures/write", s.handleGestureWrite)

	// Allow CORS for all origins. In practice this should/could be more restrictive.
	handler := cors.Default().Handler(mux)
	err := http.ListenAndServe(portNum, handler)
	if err != nil {
		log.Fatal(err)
	}
}
