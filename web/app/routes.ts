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
    // Spellings layout with nested routes
    route(
        "spellings",
        "routes/spellings/layout.tsx",
        [
            index("routes/spellings/index.tsx"),
            route("edit", "routes/spellings/edit.tsx"),
            route("test", "routes/spellings/test.tsx"),
            route("learn", "routes/spellings/learn.tsx"),
        ]
    ),
] satisfies RouteConfig;
