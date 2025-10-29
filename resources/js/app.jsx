import "../css/app.css";
import "./bootstrap";

import { createInertiaApp, router } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createRoot } from "react-dom/client";

const appName = import.meta.env.VITE_APP_NAME || "Laravel";

// Global error handler for session expiration
router.on("error", (event) => {
    if (event.detail.errors && event.detail.errors.message) {
        // Check if it's a 419 CSRF token mismatch error
        if (
            event.detail.errors.message.includes("419") ||
            event.detail.errors.message.includes("CSRF") ||
            event.detail.errors.message.includes("expired")
        ) {
            alert("Your session has expired. The page will now reload.");
            window.location.reload();
        }
    }
});

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob("./Pages/**/*.jsx")
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: "#4B5563",
    },
});
