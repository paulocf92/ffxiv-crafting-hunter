**This repository is archived!**

This repository aimed at developing a full React Native app to track Final Fantasy XIV recipe materials in a to-do list fashion. Since the project grew out of scope, I couldn't find the time/inspiration to adjust it to provide a solid storage solution which would probably involve a backend with tree data structure database support. The most relevant and interesting concepts in the development of this project were:

- App state management with `react-redux`
- Simple RESTful requests with `axios`
- Tree data handling and storage with AsyncStorage (sub-optimal)
- Deeply nested recipe trees which were traversed recursively
- Per-level data observation/update with `reselect` to smartly prevent full app re-rendering
- An effort to provide a beautiful and intuitive UX

# Crafting Hunter

_Crafting Hunter for Final Fantasy XIV_ is a small mobile app designed to help searching item recipes, hunting for their materials and tracking progress with ease.

This project depends on the awesome [XIV API](https://github.com/xivapi).

This is a work-in-progress app, so any help is greatly appreciated. :heart:
