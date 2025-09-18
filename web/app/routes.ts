import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    // Alphabets layout with nested routes
    route(
        "alphabets",
        "routes/alphabets/layout.tsx",
        [
            index("routes/alphabets/alphabets.tsx"),
            route("learn", "routes/alphabets/learn.tsx"),
            route("test", "routes/alphabets/test.tsx"),
        ]
    ),
] satisfies RouteConfig;
