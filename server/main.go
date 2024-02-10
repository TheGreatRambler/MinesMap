package main

import (
	"fmt" // formatting and printing values to the console.
	"io"
	"log"      // logging messages to the console.
	"net/http" // Used for build HTTP servers and clients.
)

// Port we listen on.
const portNum string = ":3000"

type Server struct {
	HttpClient http.Client
}

func (s *Server) GetEvents(w http.ResponseWriter, r *http.Request) {
	elevation_req, err := http.NewRequest("GET", fmt.Sprintf("http://worldtimeapi.org/api/timezone/America/Denver"), nil)
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
