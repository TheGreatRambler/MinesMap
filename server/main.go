package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
)

// Port we listen on.
const portNum string = ":3000"

type Server struct {
	HttpClient http.Client
}

type MinesEventsPayload struct {
	FilterData struct {
		Filters []struct {
			FilterName   string `json:"filterName"`
			Value        string `json:"value"`
			DisplayValue int    `json:"displayValue"`
			FilterType   int    `json:"filterType"`
		} `json:"filters"`
	} `json:"filterData"`
}

func (s *Server) GetEvents(w http.ResponseWriter, r *http.Request) {
	postBody, _ := json.Marshal(MinesEventsPayload{
		FilterData: struct {
			Filters []struct {
				FilterName   string `json:"filterName"`
				Value        string `json:"value"`
				DisplayValue int    `json:"displayValue"`
				FilterType   int    `json:"filterType"`
			} `json:"filters"`
		}{
			Filters: []struct {
				FilterName   string `json:"filterName"`
				Value        string `json:"value"`
				DisplayValue int    `json:"displayValue"`
				FilterType   int    `json:"filterType"`
			}{
				{
					FilterName:   "StartDate",
					Value:        "2024-02-1 00:00:00",
					DisplayValue: 3,
					FilterType:   3,
				}, {
					FilterName:   "EndDate",
					Value:        "2024-03-1 00:00:00",
					DisplayValue: 0,
					FilterType:   3,
				}, {
					FilterName:   "TimeZone",
					Value:        "102",
					DisplayValue: 0,
					FilterType:   2,
				}, {
					FilterName:   "RollupEventsToReservation",
					Value:        "false",
					DisplayValue: 0,
					FilterType:   0,
				}, {
					FilterName:   "ResultType",
					Value:        "Monthly",
					DisplayValue: 0,
					FilterType:   0,
				},
			},
		},
	})

	elevation_req, err := http.NewRequest("POST", fmt.Sprintf("https://mines.emscloudservice.com/web/AnonymousServersApi.aspx/BrowseEvents"), bytes.NewBuffer(postBody))
	if err != nil {
		w.WriteHeader(500)
		return
	}

	// Perform request
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

	w.WriteHeader(http.StatusOK)
	w.Write(body)
}

func main() {
	log.Println("Starting")

	s := &Server{
		HttpClient: http.Client{},
	}

	http.HandleFunc("/get_events", s.GetEvents)

	err := http.ListenAndServe(portNum, nil)
	if err != nil {
		log.Fatal(err)
	}
}
