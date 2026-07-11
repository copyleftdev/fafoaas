package main

import (
	"encoding/json"
	"fmt"
	"log"

	fafo "github.com/zuub-don/fafoaas/gen/go/fafo"
)

func main() {
	input := fafo.FuckAroundInput{
		ActorID:              "go-dogfood",
		Category:             fafo.ProductionDeploy,
		Description:          "Compile and round-trip the generated Go FAFOaaS client.",
		Recklessness:         7,
		SafeguardsClaimed:    []string{"go test", "typed constants"},
		Witnesses:            []string{"compiler"},
		WarningsDisregarded:  ptr[int64](1),
	}

	payload, err := json.Marshal(input)
	if err != nil {
		log.Fatal(err)
	}

	var roundTripped fafo.FuckAroundInput
	if err := json.Unmarshal(payload, &roundTripped); err != nil {
		log.Fatal(err)
	}

	if roundTripped.Category != fafo.ProductionDeploy {
		log.Fatalf("category drift: got %q", roundTripped.Category)
	}
	if fafo.FafoToolAnnotations["fuck_around"].DestructiveHint != true {
		log.Fatal("fuck_around must remain destructive")
	}
	if fafo.ResourceTemplates["findout"] != "fafo://findout/{actorId}" {
		log.Fatal("findout resource template drifted")
	}
	if fafo.ErrNonAppealable != -32042 {
		log.Fatal("NonAppealable error code drifted")
	}

	fmt.Printf("go dogfood: %s %s %s\n", fafo.ContractVersion, fafo.FuckAround, string(payload))
}

func ptr[T any](value T) *T {
	return &value
}
