import {
  users, User, InsertUser,
  fields, Field, InsertField,
  crops, Crop, InsertCrop,
  inputs, Input, InsertInput,
  tasks, Task, InsertTask,
  weatherData, WeatherData, InsertWeatherData
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Fields
  getAllFields(): Promise<Field[]>;
  getField(id: number): Promise<Field | undefined>;
  createField(field: InsertField): Promise<Field>;
  updateField(id: number, field: Partial<InsertField>): Promise<Field | undefined>;
  deleteField(id: number): Promise<boolean>;
  
  // Crops
  getAllCrops(): Promise<Crop[]>;
  getCropsByField(fieldId: number): Promise<Crop[]>;
  getCrop(id: number): Promise<Crop | undefined>;
  createCrop(crop: InsertCrop): Promise<Crop>;
  updateCrop(id: number, crop: Partial<InsertCrop>): Promise<Crop | undefined>;
  deleteCrop(id: number): Promise<boolean>;
  
  // Inputs
  getAllInputsByCrop(cropId: number): Promise<Input[]>;
  getInput(id: number): Promise<Input | undefined>;
  createInput(input: InsertInput): Promise<Input>;
  updateInput(id: number, input: Partial<InsertInput>): Promise<Input | undefined>;
  deleteInput(id: number): Promise<boolean>;
  
  // Tasks
  getAllTasks(): Promise<Task[]>;
  getTasksByField(fieldId: number): Promise<Task[]>;
  getTasksByCrop(cropId: number): Promise<Task[]>;
  getTasksByDate(date: Date): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Weather
  getWeatherData(): Promise<WeatherData | undefined>;
  saveWeatherData(data: InsertWeatherData): Promise<WeatherData>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private fields: Map<number, Field>;
  private crops: Map<number, Crop>;
  private inputs: Map<number, Input>;
  private tasks: Map<number, Task>;
  private weather: Map<string, WeatherData>;
  
  // Incremental IDs
  private userId: number;
  private fieldId: number;
  private cropId: number;
  private inputId: number;
  private taskId: number;
  private weatherId: number;
  
  constructor() {
    this.users = new Map();
    this.fields = new Map();
    this.crops = new Map();
    this.inputs = new Map();
    this.tasks = new Map();
    this.weather = new Map();
    
    this.userId = 1;
    this.fieldId = 1;
    this.cropId = 1;
    this.inputId = 1;
    this.taskId = 1;
    this.weatherId = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  // Initialize sample data for development
  private initializeSampleData() {
    // Sample fields
    const northField: InsertField = {
      name: "North Field",
      size: 15,
      soilType: "Loam",
      history: "Corn (2021, 2022), Fallow (2023)",
      coordinates: JSON.stringify({
        type: "Polygon",
        coordinates: [
          [
            [-95.6789, 38.1234],
            [-95.6740, 38.1234],
            [-95.6740, 38.1190],
            [-95.6789, 38.1190],
            [-95.6789, 38.1234]
          ]
        ]
      })
    };
    
    const eastField: InsertField = {
      name: "East Corn Field",
      size: 22,
      soilType: "Clay Loam",
      history: "Soybeans (2021), Corn (2022, 2023)",
      coordinates: JSON.stringify({
        type: "Polygon",
        coordinates: [
          [
            [-95.6700, 38.1200],
            [-95.6650, 38.1200],
            [-95.6650, 38.1150],
            [-95.6700, 38.1150],
            [-95.6700, 38.1200]
          ]
        ]
      })
    };
    
    const southField: InsertField = {
      name: "South Soybean Field",
      size: 18,
      soilType: "Sandy Loam",
      history: "Wheat (2021), Soybeans (2022, 2023)",
      coordinates: JSON.stringify({
        type: "Polygon",
        coordinates: [
          [
            [-95.6750, 38.1100],
            [-95.6700, 38.1100],
            [-95.6700, 38.1050],
            [-95.6750, 38.1050],
            [-95.6750, 38.1100]
          ]
        ]
      })
    };
    
    // Create fields
    this.createField(northField).then(field1 => {
      // Create crops for northField
      const cornCrop: InsertCrop = {
        fieldId: field1.id,
        name: "Corn",
        seedType: "Pioneer P9998",
        plantedDate: new Date("2023-05-05"),
        harvestDate: new Date("2023-09-30"),
        status: "healthy",
        notes: "Excellent growth so far"
      };
      
      this.createCrop(cornCrop).then(crop1 => {
        // Create inputs for the crop
        const fertilizer: InsertInput = {
          cropId: crop1.id,
          type: "fertilizer",
          name: "10-10-10 Fertilizer",
          amount: 200,
          unit: "lb",
          appliedDate: new Date("2023-06-10"),
          notes: "Applied pre-rain"
        };
        
        this.createInput(fertilizer);
        
        // Create task for the crop
        const task1: InsertTask = {
          title: "Apply fungicide to North Field",
          description: "Use XYZ fungicide at recommended rate",
          fieldId: field1.id,
          cropId: crop1.id,
          startDate: new Date(),
          endDate: new Date(new Date().setHours(new Date().getHours() + 3)),
          workersNeeded: 2,
          status: "pending"
        };
        
        this.createTask(task1);
      });
    });
    
    this.createField(eastField).then(field2 => {
      // Create crops for eastField
      const cornCrop: InsertCrop = {
        fieldId: field2.id,
        name: "Corn",
        seedType: "Asgrow AG3832",
        plantedDate: new Date("2023-05-25"),
        harvestDate: new Date("2023-10-15"),
        status: "needs-water",
        notes: "Showing signs of drought stress"
      };
      
      this.createCrop(cornCrop).then(crop2 => {
        // Create task for irrigation
        const task2: InsertTask = {
          title: "Irrigation check - East Corn Field",
          description: "Check irrigation system is working correctly",
          fieldId: field2.id,
          cropId: crop2.id,
          startDate: new Date(new Date().setHours(13, 0, 0, 0)),
          endDate: new Date(new Date().setHours(15, 0, 0, 0)),
          workersNeeded: 1,
          status: "in-progress"
        };
        
        this.createTask(task2);
      });
    });
    
    this.createField(southField).then(field3 => {
      // Create crops for southField
      const wheatCrop: InsertCrop = {
        fieldId: field3.id,
        name: "Wheat",
        seedType: "WestBred WB9479",
        plantedDate: new Date("2023-06-10"),
        harvestDate: new Date("2023-11-05"),
        status: "healthy",
        notes: "Good emergence"
      };
      
      this.createCrop(wheatCrop);
    });
    
    // Create maintenance task
    const maintenanceTask: InsertTask = {
      title: "Equipment maintenance",
      description: "Regular check of all equipment",
      startDate: new Date(new Date().setHours(7, 0, 0, 0)),
      endDate: new Date(new Date().setHours(8, 0, 0, 0)),
      workersNeeded: 1,
      status: "completed"
    };
    
    this.createTask(maintenanceTask);
    
    // Sample weather data
    const todayWeather: InsertWeatherData = {
      date: new Date(),
      temperature: 72,
      humidity: 45,
      wind: 8,
      condition: "Sunny",
      alerts: JSON.stringify(["Drought conditions"]),
      forecast: JSON.stringify([
        { day: "Mon", condition: "Sunny", temperature: 75 },
        { day: "Tue", condition: "Cloudy", temperature: 68 },
        { day: "Wed", condition: "Rain", temperature: 65 },
        { day: "Thu", condition: "Sunny", temperature: 72 },
        { day: "Fri", condition: "Sunny", temperature: 76 }
      ])
    };
    
    this.saveWeatherData(todayWeather);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Field methods
  async getAllFields(): Promise<Field[]> {
    return Array.from(this.fields.values());
  }
  
  async getField(id: number): Promise<Field | undefined> {
    return this.fields.get(id);
  }
  
  async createField(insertField: InsertField): Promise<Field> {
    const id = this.fieldId++;
    const field: Field = { 
      ...insertField, 
      id, 
      createdAt: new Date() 
    };
    this.fields.set(id, field);
    return field;
  }
  
  async updateField(id: number, fieldUpdate: Partial<InsertField>): Promise<Field | undefined> {
    const field = this.fields.get(id);
    if (!field) return undefined;
    
    const updatedField = { ...field, ...fieldUpdate };
    this.fields.set(id, updatedField);
    return updatedField;
  }
  
  async deleteField(id: number): Promise<boolean> {
    return this.fields.delete(id);
  }
  
  // Crop methods
  async getAllCrops(): Promise<Crop[]> {
    return Array.from(this.crops.values());
  }
  
  async getCropsByField(fieldId: number): Promise<Crop[]> {
    return Array.from(this.crops.values()).filter(crop => crop.fieldId === fieldId);
  }
  
  async getCrop(id: number): Promise<Crop | undefined> {
    return this.crops.get(id);
  }
  
  async createCrop(insertCrop: InsertCrop): Promise<Crop> {
    const id = this.cropId++;
    const crop: Crop = { 
      ...insertCrop, 
      id, 
      createdAt: new Date() 
    };
    this.crops.set(id, crop);
    return crop;
  }
  
  async updateCrop(id: number, cropUpdate: Partial<InsertCrop>): Promise<Crop | undefined> {
    const crop = this.crops.get(id);
    if (!crop) return undefined;
    
    const updatedCrop = { ...crop, ...cropUpdate };
    this.crops.set(id, updatedCrop);
    return updatedCrop;
  }
  
  async deleteCrop(id: number): Promise<boolean> {
    return this.crops.delete(id);
  }
  
  // Input methods
  async getAllInputsByCrop(cropId: number): Promise<Input[]> {
    return Array.from(this.inputs.values()).filter(input => input.cropId === cropId);
  }
  
  async getInput(id: number): Promise<Input | undefined> {
    return this.inputs.get(id);
  }
  
  async createInput(insertInput: InsertInput): Promise<Input> {
    const id = this.inputId++;
    const input: Input = { 
      ...insertInput, 
      id, 
      createdAt: new Date() 
    };
    this.inputs.set(id, input);
    return input;
  }
  
  async updateInput(id: number, inputUpdate: Partial<InsertInput>): Promise<Input | undefined> {
    const input = this.inputs.get(id);
    if (!input) return undefined;
    
    const updatedInput = { ...input, ...inputUpdate };
    this.inputs.set(id, updatedInput);
    return updatedInput;
  }
  
  async deleteInput(id: number): Promise<boolean> {
    return this.inputs.delete(id);
  }
  
  // Task methods
  async getAllTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }
  
  async getTasksByField(fieldId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.fieldId === fieldId);
  }
  
  async getTasksByCrop(cropId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.cropId === cropId);
  }
  
  async getTasksByDate(date: Date): Promise<Task[]> {
    const dateString = date.toISOString().split('T')[0];
    return Array.from(this.tasks.values()).filter(task => {
      const taskDateString = task.startDate.toISOString().split('T')[0];
      return taskDateString === dateString;
    });
  }
  
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }
  
  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.taskId++;
    const task: Task = { 
      ...insertTask, 
      id, 
      createdAt: new Date() 
    };
    this.tasks.set(id, task);
    return task;
  }
  
  async updateTask(id: number, taskUpdate: Partial<InsertTask>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...taskUpdate };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }
  
  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }
  
  // Weather methods
  async getWeatherData(): Promise<WeatherData | undefined> {
    const weatherArray = Array.from(this.weather.values());
    if (weatherArray.length === 0) return undefined;
    
    // Return the most recent weather data
    return weatherArray.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
  }
  
  async saveWeatherData(insertWeatherData: InsertWeatherData): Promise<WeatherData> {
    const id = this.weatherId++;
    const weatherData: WeatherData = { 
      ...insertWeatherData, 
      id, 
      createdAt: new Date() 
    };
    
    // Use date as key for easy retrieval
    const dateKey = insertWeatherData.date.toISOString().split('T')[0];
    this.weather.set(dateKey, weatherData);
    
    return weatherData;
  }
}

export const storage = new MemStorage();
