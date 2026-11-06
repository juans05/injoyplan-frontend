// GA4 events. gtag only exists after the user accepts analytics cookies
// (see components/ThirdPartyScripts), so every call is a safe no-op otherwise.
type GtagWindow = Window & { gtag?: (command: 'event', name: string, params?: Record<string, unknown>) => void };

export type AnalyticsEvent =
    | 'search'            // { search_term }
    | 'select_category'   // { category }
    | 'view_event'        // { event_id, event_name }
    | 'share'             // { method, event_id }
    | 'add_to_favorites'  // { event_id }
    | 'ticket_click'      // { event_id, platform }
    | 'sign_up'
    | 'publish_event_cta' // { user_type }
    | 'select_district';  // { district }

export function track(name: AnalyticsEvent, params?: Record<string, unknown>) {
    if (typeof window === 'undefined') return;
    try {
        (window as GtagWindow).gtag?.('event', name, params);
    } catch {
        // Analytics must never break the UI
    }
}
