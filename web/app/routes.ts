import { type RouteConfig, index,route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
     route("alphabets", "routes/alphabets/alphabets.tsx"),
     route("alphabets/learn", "routes/alphabets/learn.tsx"),
     route("alphabets/test", "routes/alphabets/test.tsx"),

] satisfies RouteConfig;
