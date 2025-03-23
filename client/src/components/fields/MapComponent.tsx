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
  const [map, setMap] = useState<any>(null);
  const [drawingManager, setDrawingManager] = useState<any>(null);
  const [fieldPolygons, setFieldPolygons] = useState<any[]>([]);
  const [drawnPolygon, setDrawnPolygon] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const location = useLocation();
  
  // Load Google Maps API
  useEffect(() => {
    let isMounted = true;
    
    const initializeGoogleMaps = async () => {
      try {
        setIsLoading(true);
        await loadGoogleMapsAPI();
        if (isMounted) setError(null);
      } catch (err) {
        console.error("Failed to load Google Maps API:", err);
        if (isMounted) setError("Failed to load Google Maps API");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    
    initializeGoogleMaps();
    
    return () => {
      isMounted = false;
    };
  }, []);
  
  // Initialize map
  useEffect(() => {
    if (!mapRef.current || isLoading) return;
    
    // Check if Google Maps API is available
    if (!window.google || !window.google.maps) {
      setError("Google Maps API not loaded");
      return;
    }
    
    try {
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
      
      const newMap = new window.google.maps.Map(mapRef.current, mapOptions);
      setMap(newMap);
      
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
        
        const newDrawingManager = new window.google.maps.drawing.DrawingManager(drawingManagerOptions);
        newDrawingManager.setMap(newMap);
        setDrawingManager(newDrawingManager);
        
        // Add event listener for when polygon is complete
        window.google.maps.event.addListener(newDrawingManager, 'polygoncomplete', function(polygon: any) {
          // Disable drawing mode after polygon is drawn
          newDrawingManager.setDrawingMode(null);
          
          // Clear any previously drawn polygon
          if (drawnPolygon) {
            drawnPolygon.setMap(null);
          }
          
          setDrawnPolygon(polygon);
          
          // Listen for polygon path changes and update coordinates
          const updateCoordinates = () => {
            if (!polygon || !polygon.getPath) return;
            
            const path = polygon.getPath();
            const coordinates = path.getArray().map((latLng: any) => [latLng.lng(), latLng.lat()]);
            // Close the polygon by repeating the first point
            coordinates.push([coordinates[0][0], coordinates[0][1]]);
            
            const geoJSON = {
              type: "Polygon",
              coordinates: [coordinates]
            };
            
            if (onBoundaryChange) {
              onBoundaryChange(JSON.stringify(geoJSON));
            }
          };
          
          updateCoordinates();
          
          // Add listeners for polygon editing
          const listener1 = window.google.maps.event.addListener(polygon.getPath(), 'insert_at', updateCoordinates);
          const listener2 = window.google.maps.event.addListener(polygon.getPath(), 'remove_at', updateCoordinates);
          const listener3 = window.google.maps.event.addListener(polygon.getPath(), 'set_at', updateCoordinates);
          const listener4 = window.google.maps.event.addListener(polygon, 'dragend', updateCoordinates);
        });
      }
      
      // Cleanup function
      return () => {
        // Clean up the map instance
        if (newMap) {
          // Remove all event listeners
          window.google.maps.event.clearInstanceListeners(newMap);
        }
        
        // Clean up drawing manager
        if (drawingManager) {
          drawingManager.setMap(null);
          window.google.maps.event.clearInstanceListeners(drawingManager);
        }
        
        // Safely clean up polygons
        if (fieldPolygons && fieldPolygons.length > 0) {
          fieldPolygons.forEach(polygon => {
            if (polygon && polygon.setMap) {
              polygon.setMap(null);
              if (window.google && window.google.maps) {
                window.google.maps.event.clearInstanceListeners(polygon);
              }
            }
          });
        }
        
        // Clean up drawn polygon
        if (drawnPolygon && drawnPolygon.setMap) {
          drawnPolygon.setMap(null);
          if (window.google && window.google.maps) {
            window.google.maps.event.clearInstanceListeners(drawnPolygon);
          }
        }
      };
    } catch (err) {
      console.error("Error initializing map:", err);
      setError("Failed to initialize map");
    }
  }, [location.coordinates.latitude, location.coordinates.longitude, isLoading]);
  
  // Display field polygons on the map
  useEffect(() => {
    if (!map || !window.google || !window.google.maps) return;
    
    try {
      // Create a local reference to maintain the list of current polygons
      let currentPolygons: any[] = [];
      
      // Safely clean up existing polygons
      if (fieldPolygons && fieldPolygons.length > 0) {
        fieldPolygons.forEach(polygon => {
          if (polygon && polygon.setMap) {
            polygon.setMap(null);
            window.google.maps.event.clearInstanceListeners(polygon);
          }
        });
      }
      
      // Create new polygons for each field
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
            
            const polygon = new window.google.maps.Polygon({
              paths,
              strokeColor: color.stroke,
              strokeOpacity: 1.0,
              strokeWeight: 2,
              fillColor: color.fill,
              fillOpacity: 0.35,
              map
            });
            
            // Add field info window on click
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
              
              infoWindow.open(map);
            });
            
            currentPolygons.push(polygon);
          }
        } catch (error) {
          console.error(`Failed to parse field coordinates for field ${field.id}:`, error);
        }
      });
      
      // Update state with new polygons
      setFieldPolygons(currentPolygons);
      
      // Fit bounds to show all fields if we have any
      if (currentPolygons.length > 0 && window.google.maps.LatLngBounds) {
        try {
          const bounds = new window.google.maps.LatLngBounds();
          currentPolygons.forEach(polygon => {
            if (polygon && polygon.getPath) {
              const path = polygon.getPath();
              for (let i = 0; i < path.getLength(); i++) {
                bounds.extend(path.getAt(i));
              }
            }
          });
          map.fitBounds(bounds);
        } catch (err) {
          console.error("Error fitting bounds:", err);
        }
      }
      
      // Return cleanup function
      return () => {
        // Safely clean up polygons
        currentPolygons.forEach(polygon => {
          if (polygon && polygon.setMap) {
            polygon.setMap(null);
            if (window.google && window.google.maps) {
              window.google.maps.event.clearInstanceListeners(polygon);
            }
          }
        });
      };
    } catch (err) {
      console.error("Error displaying fields:", err);
      setError("Failed to display fields");
    }
  }, [map, fields]);
  
  // Render map or error message
  return (
    <div 
      ref={mapRef} 
      className="w-full h-full relative"
      style={{ minHeight: '300px', background: '#E0E0E0' }}
    >
      {(isLoading || (!map && !error)) && (
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
