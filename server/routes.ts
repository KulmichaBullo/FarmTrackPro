import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ZodError } from "zod";
import {
  insertFieldSchema,
  insertCropSchema,
  insertInputSchema,
  insertTaskSchema,
  insertWeatherSchema
} from "@shared/schema";

// Helper function to validate request body with Zod schema
function validateBody(req: Request, schema: any) {
  try {
    return schema.parse(req.body);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup API routes
  
  /**
   * Field Routes
   */
  // Get all fields
  app.get("/api/fields", async (req: Request, res: Response) => {
    try {
      const fields = await storage.getAllFields();
      res.json(fields);
    } catch (error) {
      res.status(500).json({ message: "Error fetching fields", error: (error as Error).message });
    }
  });
  
  // Get specific field
  app.get("/api/fields/:id", async (req: Request, res: Response) => {
    try {
      const field = await storage.getField(parseInt(req.params.id));
      if (!field) {
        return res.status(404).json({ message: "Field not found" });
      }
      res.json(field);
    } catch (error) {
      res.status(500).json({ message: "Error fetching field", error: (error as Error).message });
    }
  });
  
  // Create field
  app.post("/api/fields", async (req: Request, res: Response) => {
    try {
      const validatedData = validateBody(req, insertFieldSchema);
      const field = await storage.createField(validatedData);
      res.status(201).json(field);
    } catch (error) {
      res.status(400).json({ message: "Error creating field", error: (error as Error).message });
    }
  });
  
  // Update field
  app.patch("/api/fields/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = validateBody(req, insertFieldSchema.partial());
      const field = await storage.updateField(id, validatedData);
      
      if (!field) {
        return res.status(404).json({ message: "Field not found" });
      }
      
      res.json(field);
    } catch (error) {
      res.status(400).json({ message: "Error updating field", error: (error as Error).message });
    }
  });
  
  // Delete field
  app.delete("/api/fields/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteField(id);
      
      if (!success) {
        return res.status(404).json({ message: "Field not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting field", error: (error as Error).message });
    }
  });
  
  /**
   * Crop Routes
   */
  // Get all crops
  app.get("/api/crops", async (req: Request, res: Response) => {
    try {
      const crops = await storage.getAllCrops();
      res.json(crops);
    } catch (error) {
      res.status(500).json({ message: "Error fetching crops", error: (error as Error).message });
    }
  });
  
  // Get crops by field
  app.get("/api/fields/:fieldId/crops", async (req: Request, res: Response) => {
    try {
      const fieldId = parseInt(req.params.fieldId);
      const crops = await storage.getCropsByField(fieldId);
      res.json(crops);
    } catch (error) {
      res.status(500).json({ message: "Error fetching crops", error: (error as Error).message });
    }
  });
  
  // Get specific crop
  app.get("/api/crops/:id", async (req: Request, res: Response) => {
    try {
      const crop = await storage.getCrop(parseInt(req.params.id));
      if (!crop) {
        return res.status(404).json({ message: "Crop not found" });
      }
      res.json(crop);
    } catch (error) {
      res.status(500).json({ message: "Error fetching crop", error: (error as Error).message });
    }
  });
  
  // Create crop
  app.post("/api/crops", async (req: Request, res: Response) => {
    try {
      const validatedData = validateBody(req, insertCropSchema);
      const crop = await storage.createCrop(validatedData);
      res.status(201).json(crop);
    } catch (error) {
      res.status(400).json({ message: "Error creating crop", error: (error as Error).message });
    }
  });
  
  // Update crop
  app.patch("/api/crops/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = validateBody(req, insertCropSchema.partial());
      const crop = await storage.updateCrop(id, validatedData);
      
      if (!crop) {
        return res.status(404).json({ message: "Crop not found" });
      }
      
      res.json(crop);
    } catch (error) {
      res.status(400).json({ message: "Error updating crop", error: (error as Error).message });
    }
  });
  
  // Delete crop
  app.delete("/api/crops/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCrop(id);
      
      if (!success) {
        return res.status(404).json({ message: "Crop not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting crop", error: (error as Error).message });
    }
  });
  
  /**
   * Input Routes
   */
  // Get inputs by crop
  app.get("/api/crops/:cropId/inputs", async (req: Request, res: Response) => {
    try {
      const cropId = parseInt(req.params.cropId);
      const inputs = await storage.getAllInputsByCrop(cropId);
      res.json(inputs);
    } catch (error) {
      res.status(500).json({ message: "Error fetching inputs", error: (error as Error).message });
    }
  });
  
  // Create input
  app.post("/api/inputs", async (req: Request, res: Response) => {
    try {
      const validatedData = validateBody(req, insertInputSchema);
      const input = await storage.createInput(validatedData);
      res.status(201).json(input);
    } catch (error) {
      res.status(400).json({ message: "Error creating input", error: (error as Error).message });
    }
  });
  
  /**
   * Task Routes
   */
  // Get all tasks
  app.get("/api/tasks", async (req: Request, res: Response) => {
    try {
      const tasks = await storage.getAllTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Error fetching tasks", error: (error as Error).message });
    }
  });
  
  // Get tasks by date
  app.get("/api/tasks/date/:date", async (req: Request, res: Response) => {
    try {
      const date = new Date(req.params.date);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      
      const tasks = await storage.getTasksByDate(date);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Error fetching tasks", error: (error as Error).message });
    }
  });
  
  // Get specific task
  app.get("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const task = await storage.getTask(parseInt(req.params.id));
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Error fetching task", error: (error as Error).message });
    }
  });
  
  // Create task
  app.post("/api/tasks", async (req: Request, res: Response) => {
    try {
      const validatedData = validateBody(req, insertTaskSchema);
      const task = await storage.createTask(validatedData);
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ message: "Error creating task", error: (error as Error).message });
    }
  });
  
  // Update task
  app.patch("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = validateBody(req, insertTaskSchema.partial());
      const task = await storage.updateTask(id, validatedData);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      res.status(400).json({ message: "Error updating task", error: (error as Error).message });
    }
  });
  
  // Delete task
  app.delete("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTask(id);
      
      if (!success) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting task", error: (error as Error).message });
    }
  });
  
  /**
   * Weather Routes
   */
  // Get current weather data
  app.get("/api/weather", async (req: Request, res: Response) => {
    try {
      const weather = await storage.getWeatherData();
      if (!weather) {
        return res.status(404).json({ message: "Weather data not found" });
      }
      res.json(weather);
    } catch (error) {
      res.status(500).json({ message: "Error fetching weather data", error: (error as Error).message });
    }
  });
  
  // Save weather data
  app.post("/api/weather", async (req: Request, res: Response) => {
    try {
      const validatedData = validateBody(req, insertWeatherSchema);
      const weather = await storage.saveWeatherData(validatedData);
      res.status(201).json(weather);
    } catch (error) {
      res.status(400).json({ message: "Error saving weather data", error: (error as Error).message });
    }
  });
  
  // OpenWeather API proxy
  app.get("/api/weather/openweather", async (req: Request, res: Response) => {
    try {
      const { lat, lon } = req.query;
      if (!lat || !lon) {
        return res.status(400).json({ message: "Missing latitude or longitude" });
      }

      const apiKey = process.env.OPENWEATHER_API_KEY || import.meta.env.VITE_GOOGLE_MAPS_API_KEY; // Using available key for demo
      if (!apiKey) {
        return res.status(500).json({ message: "API key not configured" });
      }

      // Current weather
      const currentResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`
      );

      if (!currentResponse.ok) {
        throw new Error(`OpenWeather API error: ${currentResponse.statusText}`);
      }

      const currentData = await currentResponse.json();

      // One Call API for 7-day forecast
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&appid=${apiKey}&units=imperial`
      );

      let forecastData = [];
      let alerts = [];

      // Handle forecast data if available
      if (forecastResponse.ok) {
        const oneCallData = await forecastResponse.json();
        
        // Format 7-day forecast
        forecastData = oneCallData.daily.slice(0, 7).map((day: any, index: number) => {
          const date = new Date();
          date.setDate(date.getDate() + index);
          return {
            day: date.toLocaleDateString('en-US', { weekday: 'short' }),
            condition: day.weather[0].main,
            temperature: Math.round(day.temp.day)
          };
        });
        
        // Get weather alerts if any
        if (oneCallData.alerts && oneCallData.alerts.length > 0) {
          alerts = oneCallData.alerts.map((alert: any) => alert.event);
        }
      } else {
        console.warn("Could not fetch forecast data, using current weather only");
        // Create a simple 7-day forecast based on current weather
        forecastData = Array.from({ length: 7 }, (_, index) => {
          const date = new Date();
          date.setDate(date.getDate() + index);
          return {
            day: date.toLocaleDateString('en-US', { weekday: 'short' }),
            condition: currentData.weather[0].main,
            temperature: Math.round(currentData.main.temp)
          };
        });
      }

      const formattedWeather = {
        temperature: Math.round(currentData.main.temp),
        condition: currentData.weather[0].main,
        humidity: currentData.main.humidity,
        wind: Math.round(currentData.wind.speed),
        alerts: JSON.stringify(alerts),
        forecast: JSON.stringify(forecastData),
        date: new Date().toISOString(),
        id: 1,
        createdAt: new Date().toISOString()
      };

      res.json(formattedWeather);
    } catch (error) {
      res.status(500).json({ message: "Error fetching weather data", error: (error as Error).message });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  
  // Return the server
  return httpServer;
}
