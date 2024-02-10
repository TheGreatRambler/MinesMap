package main

import (
	"log"
	"net/http"
	"regexp"
	"os"
	"encoding/json"

	"github.com/andybalholm/brotli"
)

// Port we listen on.
const portNum string = ":3000"

type Server struct {
	HttpClient    http.Client
	HomepageRegex *regexp.Regexp
}

func (s *Server) GetEvents(w http.ResponseWriter, r *http.Request) {
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

	_, err = w.Write([]byte(dValue))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func main() {
	s := &Server{
		HttpClient:    http.Client{},
		HomepageRegex: homepage_token,
	}

	http.HandleFunc("/get_events", s.GetEvents)

	err = http.ListenAndServe(portNum, nil)
	if err != nil {
		log.Fatal(err)
	}
}
