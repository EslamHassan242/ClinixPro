"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { RealtimePostgresUpdatePayload } from "@supabase/supabase-js";

interface UseQueueRealtimeProps {
    tenantId: string | null;
    onUpdate: () => void;
}

/**
 * Hook to listen for real-time changes to the queue (appointments and tickets).
 */
export function useQueueRealtime({ tenantId, onUpdate }: UseQueueRealtimeProps) {
    const supabase = createClient();

    useEffect(() => {
        if (!tenantId) return;

        // Subscribe to Appointment changes
        const appointmentChannel = supabase
            .channel(`public:Appointment:tenantId=eq.${tenantId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "Appointment",
                    filter: `tenantId=eq.${tenantId}`,
                },
                (payload) => {
                    console.log("Real-time Appointment update:", payload);
                    onUpdate();
                }
            )
            .subscribe();

        // Subscribe to QueueTicket changes
        const ticketChannel = supabase
            .channel(`public:QueueTicket:tenantId=eq.${tenantId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "QueueTicket",
                    filter: `tenantId=eq.${tenantId}`,
                },
                (payload) => {
                    console.log("Real-time QueueTicket update:", payload);
                    onUpdate();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(appointmentChannel);
            supabase.removeChannel(ticketChannel);
        };
    }, [tenantId, onUpdate, supabase]);
}
