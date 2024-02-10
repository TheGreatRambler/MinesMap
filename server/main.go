package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"regexp"
)

// Port we listen on.
const portNum string = ":3000"

type Server struct {
	HttpClient    http.Client
	HomepageRegex *regexp.Regexp
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
	homepage_req, err := http.NewRequest("GET", fmt.Sprintf("https://mines.emscloudservice.com/web/BrowseEvents.aspx"), nil)
	if err != nil {
		w.WriteHeader(500)
		return
	}

	homepage_req.Header.Set("Origin", "https://mines.emscloudservice.com")
	homepage_req.Header.Set("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0")
	homepage_req.Header.Set("Host", "mines.emscloudservice.com")
	homepage_req.Header.Set("Sec-Fetch-Dest", "document")
	homepage_req.Header.Set("Sec-Fetch-Mode", "navigate")
	homepage_req.Header.Set("Sec-Fetch-Site", "none")
	homepage_req.Header.Set("Sec-Fetch-User", "?1")
	homepage_req.Header.Set("Upgrade-Insecure-Requests", "1")
	homepage_req.Header.Set("Connection", "keep-alive")

	/*
		homepage_req.AddCookie(&http.Cookie{
			Name:  "OptanonConsent",
			Value: "consentId=ca5945b7-bcc1-46be-86eb-bf2b4a85ee1b&datestamp=Sat+Feb+10+2024+14%3A49%3A17+GMT-0700+(Mountain+Standard+Time)&version=6.33.0&interactionCount=1&isGpcEnabled=0&isIABGlobal=false&hosts=&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A1%2CC0003%3A1%2CC0004%3A1; ASP.NET_SessionId=zkrjbhfo3zubsjwn2em0ftk2; __AntiXsrfToken=47f02afecaa542bcbf8d23d070e15207; OptanonAlertBoxClosed=2024-02-10T22:03:57.527Z",
		})
	*/

	// Perform request
	res, err := s.HttpClient.Do(homepage_req)
	if err != nil {
		w.WriteHeader(500)
		return
	}

	homepage_body, err := io.ReadAll(res.Body)
	if err != nil {
		w.WriteHeader(500)
		return
	}

	fmt.Println("BODY %s", string(homepage_body))

	homepageTokenMatch := s.HomepageRegex.Find(homepage_body)

	fmt.Println("TEST1 %s", homepageTokenMatch)

	homepageToken := homepageTokenMatch[25 : len(homepageTokenMatch)-1]

	fmt.Println("TEST %s", homepageToken)

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

	elevation_req.Header.Set("Origin", "https://mines.emscloudservice.com")
	elevation_req.Header.Set("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0")
	elevation_req.Header.Set("Host", "mines.emscloudservice.com")
	elevation_req.Header.Set("dea-CSRFToken", string(homepageToken))

	elevation_req.AddCookie(&http.Cookie{
		Name:  "ASP.NET_SessionId",
		Value: "0pr4kcnfvzyfaav3v40bsjla",
	})
	elevation_req.AddCookie(&http.Cookie{
		Name:  "__AntiXsrfToken",
		Value: "54a688b2eae94276990379154b1b053e",
	})
	elevation_req.AddCookie(&http.Cookie{
		Name:  "OptanonAlertBoxClosed",
		Value: "2024-02-10T20:53:38.110Z",
	})
	elevation_req.AddCookie(&http.Cookie{
		Name:  "OptanonConsent",
		Value: "isGpcEnabled=0&datestamp=Sat+Feb+10+2024+13%3A53%3A38+GMT-0700+(Mountain+Standard+Time)&version=6.33.0&isIABGlobal=false&hosts=&consentId=0410ffad-6a07-4daf-9ee7-4688c8cc537c&interactionCount=1&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A1%2CC0003%3A1%2CC0004%3A1&geolocation=US%3BCO&AwaitingReconsent=false",
	})

	// Perform request
	res, err = s.HttpClient.Do(elevation_req)
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

	homepage_token, err := regexp.Compile("id=\"deaCSRFToken\" value=\"[^\"]+\"")
	if err != nil {
		log.Fatal(err)
	}

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
