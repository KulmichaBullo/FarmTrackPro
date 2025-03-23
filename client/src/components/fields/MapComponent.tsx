import { useEffect, useRef, useState } from 'react';
import { useLocation } from '@/lib/hooks/useLocation';
import { Field } from '@shared/schema';
import { loadGoogleMapsAPI } from '@/lib/utils/googleMaps';

interface MapComponentProps {
  fields: Field[];
  editable?: boolean;
  onBoundaryChange?: (coordinates: string) => void;
}

export default function MapComponent({ fields, editable = false, onBoundaryChange }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Component-wide references stored in Refs to avoid state updates
  const mapInstanceRef = useRef<any>(null);
  const drawingManagerRef = useRef<any>(null);
  const polygonsRef = useRef<any[]>([]);
  const drawnPolygonRef = useRef<any>(null);
  
  const location = useLocation();
  
  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        setIsLoading(true);
        setError(null);
        await loadGoogleMapsAPI();
        setIsMapLoaded(true);
      } catch (err) {
        console.error("Failed to load Google Maps API:", err);
        setError("Failed to load Google Maps API");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadGoogleMaps();
    
    // Clean up on unmount
    return () => {
      cleanupGoogleMaps();
    };
  }, []);
  
  // Function to clean up Google Maps objects
  const cleanupGoogleMaps = () => {
    try {
      // Clean up polygons
      if (polygonsRef.current) {
        polygonsRef.current.forEach(polygon => {
          if (polygon && typeof polygon.setMap === 'function') {
            polygon.setMap(null);
          }
        });
        polygonsRef.current = [];
      }
      
      // Clean up drawn polygon
      if (drawnPolygonRef.current && typeof drawnPolygonRef.current.setMap === 'function') {
        drawnPolygonRef.current.setMap(null);
        drawnPolygonRef.current = null;
      }
      
      // Clean up drawing manager
      if (drawingManagerRef.current && typeof drawingManagerRef.current.setMap === 'function') {
        drawingManagerRef.current.setMap(null);
        drawingManagerRef.current = null;
      }
      
      // Clean up map
      mapInstanceRef.current = null;
    } catch (error) {
      console.error("Error cleaning up Google Maps:", error);
    }
  };
  
  // Initialize map when Google Maps is loaded
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || !window.google || !window.google.maps) {
      return;
    }
    
    try {
      // Clear previous instances if they exist
      cleanupGoogleMaps();
      
      // Set default location if user location is not available
      const defaultLat = 38.1234;
      const defaultLng = -95.6789;
      
      const mapOptions = {
        center: {
          lat: location.coordinates.latitude || defaultLat,
          lng: location.coordinates.longitude || defaultLng
        },
        zoom: 15,
        mapTypeId: window.google.maps.MapTypeId.SATELLITE,
        streetViewControl: false,
      };
      
      // Create new map instance
      const mapInstance = new window.google.maps.Map(mapRef.current, mapOptions);
      mapInstanceRef.current = mapInstance;
      
      // Initialize drawing manager if in editable mode
      if (editable && window.google.maps.drawing) {
        const drawingManagerOptions = {
          drawingMode: window.google.maps.drawing.OverlayType.POLYGON,
          drawingControl: true,
          drawingControlOptions: {
            position: window.google.maps.ControlPosition.TOP_CENTER,
            drawingModes: [window.google.maps.drawing.OverlayType.POLYGON]
          },
          polygonOptions: {
            fillColor: '#4CAF50',
            fillOpacity: 0.5,
            strokeWeight: 2,
            strokeColor: '#2E7D32',
            editable: true,
            draggable: true
          }
        };
        
        const drawingManager = new window.google.maps.drawing.DrawingManager(drawingManagerOptions);
        drawingManager.setMap(mapInstance);
        drawingManagerRef.current = drawingManager;
        
        // Handle polygon drawing completion
        const handlePolygonComplete = (polygon: any) => {
          // Disable drawing mode
          drawingManager.setDrawingMode(null);
          
          // Clear any previous drawn polygon
          if (drawnPolygonRef.current) {
            drawnPolygonRef.current.setMap(null);
          }
          
          drawnPolygonRef.current = polygon;
          
          // Create function to update coordinates
          const updateCoordinates = () => {
            if (!polygon || !polygon.getPath) return;
            
            const path = polygon.getPath();
            const coordinates = [];
            
            // Convert path to coordinates array
            for (let i = 0; i < path.getLength(); i++) {
              const point = path.getAt(i);
              coordinates.push([point.lng(), point.lat()]);
            }
            
            // Close the polygon by repeating the first point
            if (coordinates.length > 0) {
              coordinates.push([coordinates[0][0], coordinates[0][1]]);
            }
            
            const geoJSON = {
              type: "Polygon",
              coordinates: [coordinates]
            };
            
            if (onBoundaryChange) {
              onBoundaryChange(JSON.stringify(geoJSON));
            }
          };
          
          // Initial coordinates update
          updateCoordinates();
          
          // Add event listeners for polygon editing
          window.google.maps.event.addListener(polygon.getPath(), 'insert_at', updateCoordinates);
          window.google.maps.event.addListener(polygon.getPath(), 'remove_at', updateCoordinates);
          window.google.maps.event.addListener(polygon.getPath(), 'set_at', updateCoordinates);
          window.google.maps.event.addListener(polygon, 'dragend', updateCoordinates);
        };
        
        // Add the event listener
        window.google.maps.event.addListener(drawingManager, 'polygoncomplete', handlePolygonComplete);
      }
      
      // Display fields when map is initialized
      displayFields(mapInstance);
      
    } catch (err) {
      console.error("Error initializing map:", err);
      setError("Failed to initialize map");
    }
  }, [isMapLoaded, location.coordinates.latitude, location.coordinates.longitude, editable, onBoundaryChange]);
  
  // Update field display when fields change
  useEffect(() => {
    if (isMapLoaded && mapInstanceRef.current) {
      displayFields(mapInstanceRef.current);
    }
  }, [fields, isMapLoaded]);
  
  // Function to display fields on the map
  const displayFields = (mapInstance: any) => {
    if (!mapInstance || !window.google || !window.google.maps) return;
    
    try {
      // Clear previous polygons
      polygonsRef.current.forEach(polygon => {
        if (polygon && typeof polygon.setMap === 'function') {
          polygon.setMap(null);
        }
      });
      
      // Create new array to store polygons
      const newPolygons: any[] = [];
      
      // Create polygons for each field
      fields.forEach((field, index) => {
        try {
          if (!field.coordinates) return;
          
          const geoJSON = JSON.parse(field.coordinates);
          if (geoJSON.type === 'Polygon' && geoJSON.coordinates && geoJSON.coordinates.length > 0) {
            const paths = geoJSON.coordinates[0].map((coord: number[]) => {
              return { lat: coord[1], lng: coord[0] };
            });
            
            // Get color based on index
            const colors = [
              { fill: '#4CAF50', stroke: '#2E7D32' }, // primary
              { fill: '#FFB74D', stroke: '#FFA000' }, // secondary
              { fill: '#42A5F5', stroke: '#1976D2' }, // accent
              { fill: '#9C27B0', stroke: '#7B1FA2' }, // purple
              { fill: '#F06292', stroke: '#D81B60' }, // pink
              { fill: '#26A69A', stroke: '#00897B' }, // teal
            ];
            const color = colors[index % colors.length];
            
            // Create polygon
            const polygon = new window.google.maps.Polygon({
              paths,
              strokeColor: color.stroke,
              strokeOpacity: 1.0,
              strokeWeight: 2,
              fillColor: color.fill,
              fillOpacity: 0.35,
              map: mapInstance
            });
            
            // Add info window on click
            window.google.maps.event.addListener(polygon, 'click', function(event: any) {
              const infoWindow = new window.google.maps.InfoWindow({
                content: `
                  <div>
                    <h3 style="font-weight: bold; margin-bottom: 5px;">${field.name}</h3>
                    <p style="margin: 3px 0;">Size: ${field.size} acres</p>
                    <p style="margin: 3px 0;">Soil: ${field.soilType}</p>
                  </div>
                `,
                position: event.latLng
              });
              
              infoWindow.open(mapInstance);
            });
            
            newPolygons.push(polygon);
          }
        } catch (error) {
          console.error(`Failed to parse field coordinates for field ${field.id}:`, error);
        }
      });
      
      // Update polygons reference
      polygonsRef.current = newPolygons;
      
      // Fit bounds to show all fields
      if (newPolygons.length > 0) {
        try {
          const bounds = new window.google.maps.LatLngBounds();
          
          newPolygons.forEach(polygon => {
            if (polygon && polygon.getPath) {
              const path = polygon.getPath();
              for (let i = 0; i < path.getLength(); i++) {
                bounds.extend(path.getAt(i));
              }
            }
          });
          
          mapInstance.fitBounds(bounds);
        } catch (err) {
          console.error("Error fitting bounds:", err);
        }
      }
    } catch (err) {
      console.error("Error displaying fields:", err);
      setError("Failed to display fields");
    }
  };
  
  return (
    <div 
      ref={mapRef} 
      className="w-full h-full relative"
      style={{ minHeight: '300px', background: '#E0E0E0' }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <span className="material-icons text-4xl">map</span>
            <p>Loading map...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <span className="material-icons text-4xl text-red-500">error</span>
            <p>{error}</p>
            <p className="text-sm mt-2">A Google Maps API key may be required</p>
          </div>
        </div>
      )}
    </div>
  );
}
