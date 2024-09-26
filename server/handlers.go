package server

import "github.com/gofiber/fiber/v2"

func HandleFrontRoutes(app *fiber.App, routes []string) {
	app.Static("/", "./dist", fiber.Static{
		CacheDuration: 200,
	})

	for _, r := range routes {
		app.Get(r, func(c *fiber.Ctx) error {
			return c.Render("dist/index.html", fiber.Map{})
		})
	}
}
