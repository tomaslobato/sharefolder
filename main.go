package main

import (
	"sharefolder/server"

	"github.com/gofiber/fiber/v2"
)

const root = "/home/tomi/Documents/new/"

type File struct {
	Name    string `json:"name"`
	IsDir   bool   `json:"isDir"`
	ChildOf string `json:"childOf"`
	Id      string `json:"id"`
}

func main() {
	app := fiber.New()

	server.HandleFrontRoutes(app, []string{"/"})

	app.Get("/getfiles", server.HandleGetFiles)

	app.Post("/create", server.HandleNewFile)

	app.Listen(":3000")
}
