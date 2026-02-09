// @ts-nocheck
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";

// Fix Leaflet's default icon path issues in React
const defaultIcon = new Icon({
    iconUrl: markerIconPng,
    shadowUrl: markerShadowPng,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

interface RouteMapOverlayProps {
    shipments: any[];
    height?: string;
}

export function RouteMapOverlay({ shipments, height = "400px" }: RouteMapOverlayProps) {
    // Filter valid shipments with coordinates
    const validShipments = shipments.filter(s =>
        s.sourceLat && s.sourceLng && s.destLat && s.destLng
    );

    const centerVec = validShipments.length > 0
        ? [Number(validShipments[0].sourceLat), Number(validShipments[0].sourceLng)] as [number, number]
        : [37.7749, -122.4194] as [number, number]; // Default to SF

    return (
        <div className="w-full rounded-md overflow-hidden border shadow-sm h-[400px]">
            <MapContainer
                center={centerVec}
                zoom={4}
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {validShipments.map(s => (
                    <React.Fragment key={s.id}>
                        {/* Source Marker */}
                        <Marker position={[Number(s.sourceLat), Number(s.sourceLng)]} icon={defaultIcon}>
                            <Popup>
                                <strong>Origin: {s.sourceCode}</strong><br />
                                {s.sourceCity}, {s.shipmentNumber}
                            </Popup>
                        </Marker>

                        {/* Dist Marker */}
                        <Marker position={[Number(s.destLat), Number(s.destLng)]} icon={defaultIcon}>
                            <Popup>
                                <strong>Dest: {s.destCode}</strong><br />
                                {s.destCity}
                            </Popup>
                        </Marker>

                        {/* Route Line */}
                        <Polyline
                            positions={[
                                [Number(s.sourceLat), Number(s.sourceLng)],
                                [Number(s.destLat), Number(s.destLng)]
                            ]}
                            color="blue"
                            weight={2}
                            opacity={0.6}
                        />
                    </React.Fragment>
                ))}
            </MapContainer>
        </div>
    );
}
