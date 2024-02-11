package main

import (
	"log"
	"net/http"
	"regexp"
	"os"
	"encoding/json"

	"github.com/rs/cors"
	"github.com/andybalholm/brotli"
)

// Port we listen on.
const portNum string = ":3001"

type Server struct {
	HttpClient    http.Client
	HomepageRegex *regexp.Regexp
}

func (s *Server) GetEvents(w http.ResponseWriter, r *http.Request) {
	buildingCode := r.URL.Query().Get("buildingCode")
	roomNumber := r.URL.Query().Get("roomNumber")

	filePath := "./events"
	file, err := os.Open(filePath)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer file.Close()

	brReader := brotli.NewReader(file)
	jsonDecoder := json.NewDecoder(brReader)

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

	// Parse new data as json
	var jsonData map[string]interface{}
	err = json.Unmarshal([]byte(dValue), &jsonData)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Filter events by buildingCode and roomNumber
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

	// Remove all but the EventName, GroupName, TimeBookingStart, and TimeBookingEnd fields.
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

	// Marshal the stripped events to a new json string
	newJsonData, err := json.Marshal(strippedEvents)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Set CORS headers
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	_, err = w.Write([]byte(newJsonData))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func main() {
	s := &Server{
		HttpClient:    http.Client{},
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/events", s.GetEvents)

	handler := cors.Default().Handler(mux)
	err := http.ListenAndServe(portNum, handler)
	if err != nil {
		log.Fatal(err)
	}
}
