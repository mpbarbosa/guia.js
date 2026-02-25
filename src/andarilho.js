// Store current coordinates and address globally
let currentCoords = null;
let currentAddress = null;
const findRestaurantsBtn = document.getElementById("findRestaurantsBtn");
const cityStatsBtn = document.getElementById("cityStatsBtn");

function getLocation() {
	const locationResult = document.getElementById("locationResult");
	checkGeolocation(locationResult);

	// Show loading message
	//locationResult.innerHTML =
	//	'<p class="loading">Buscando a sua localização...</p>';
	currentCoords = null;
	currentAddress = null;

	// Get current position
	navigator.geolocation.getCurrentPosition(
		async (position) => {
			try {
				// Update the address section
				const addressSection = document.getElementById("addressSection");
				addressSection.innerHTML = renderAddress(address);

				// Enable city stats button if we have a city
				if (
					address.address &&
					(address.address.city ||
						address.address.town ||
						address.address.village)
				) {
					if (cityStatsBtn) {
						cityStatsBtn.disabled = false;
					}
				}

				const text_input = document.getElementById("text-input");
				if (text_input) {
					tts = buildTextToSpeech(address.address);
					text_input.value = tts;
					console.log("tts:", tts);
					speak(tts);
				}
			} catch (error) {
				const addressSection = document.getElementById("addressSection");
				addressSection.innerHTML = `
                            <p class="error">Could not retrieve address: ${error.message}</p>
                        `;
			}
		},
		(error) => {
			// Error callback
			let errorMessage;
			switch (error.code) {
				case error.PERMISSION_DENIED:
					errorMessage = "User denied the request for Geolocation.";
					break;
				case error.POSITION_UNAVAILABLE:
					errorMessage = "Location information is unavailable.";
					break;
				case error.TIMEOUT:
					errorMessage = "The request to get user location timed out.";
					break;
				case error.UNKNOWN_ERROR:
					errorMessage = "An unknown error occurred.";
					break;
			}
			locationResult.innerHTML = `<p class="error">Error: ${errorMessage}</p>`;
			findRestaurantsBtn.disabled = true;
			cityStatsBtn.disabled = true;
		},
		{
			// Options: enable high accuracy if available
			enableHighAccuracy: true,
			timeout: 10000, // 10 seconds
			maximumAge: 0, // Don't use a cached position
		},
	);
}

async function findNearbyRestaurants() {
	if (!currentCoords) {
		alert("Please get your location first");
		return;
	}

	const restaurantsSection = document.getElementById("restaurantsSection");
	const restaurantsList = document.getElementById("restaurantsList");

	restaurantsSection.style.display = "block";
	restaurantsList.innerHTML =
		'<p class="loading">Searching for restaurants within 500 meters...</p>';
	findRestaurantsBtn.disabled = true;

	try {
		const restaurants = await getNearbyRestaurants(
			currentCoords.latitude,
			currentCoords.longitude,
			500, // radius in meters
		);

		if (restaurants.length === 0) {
			restaurantsList.innerHTML =
				"<p>No restaurants found within 500 meters.</p>";
		} else {
			restaurantsList.innerHTML = "";
			restaurants.forEach((restaurant) => {
				const restaurantElement = document.createElement("div");
				restaurantElement.className = "restaurant";
				restaurantElement.innerHTML = `
                            <h4>${restaurant.tags.name || "Unnamed Restaurant"}</h4>
                            ${restaurant.tags.cuisine ? `<p>Cuisine: ${restaurant.tags.cuisine}</p>` : ""}
                            ${restaurant.tags["addr:street"] ? `<p>Address: ${restaurant.tags["addr:street"]}</p>` : ""}
                            <p>Distance: ${Math.round(restaurant.distance)} meters</p>
                            <a href="https://www.openstreetmap.org/node/${restaurant.id}" target="_blank">View on Map</a>
                        `;
				restaurantsList.appendChild(restaurantElement);
			});
		}
	} catch (error) {
		restaurantsList.innerHTML = `<p class="error">Failed to fetch restaurants: ${error.message}</p>`;
	} finally {
		findRestaurantsBtn.disabled = false;
	}
}

async function getCityStats() {
	if (!currentAddress || !currentAddress.address) {
		alert("City information not available");
		return;
	}

	const cityStatsSection = document.getElementById("cityStatsSection");
	const cityStatsDiv = document.getElementById("cityStats");

	cityStatsSection.style.display = "block";
	cityStatsDiv.innerHTML =
		'<p class="loading">Fetching city statistics from Wikipedia...</p>';
	cityStatsBtn.disabled = true;

	try {
		// Determine city name (could be city, town, or village in OSM)
		const cityName =
			currentAddress.address.city ||
			currentAddress.address.town ||
			currentAddress.address.village;
		const state = currentAddress.address.state || "";
		const country = currentAddress.address.country || "";

		// Search Wikipedia for the city
		const searchResults = await searchWikipedia(
			`${cityName}, ${state} ${country}`,
		);

		if (
			searchResults.query &&
			searchResults.query.search &&
			searchResults.query.search.length > 0
		) {
			// Get the first result (most likely the city page)
			const pageId = searchResults.query.search[0].pageid;
			const pageTitle = searchResults.query.search[0].title;

			// Get the page content
			const pageContent = await getWikipediaPage(pageId);

			// Extract population and area from the page
			const stats = extractCityStats(pageContent);

			// Display the results
			cityStatsDiv.innerHTML = `
                        <h4>${pageTitle}</h4>
                        <div class="stats-grid">
                            ${
															stats.population
																? `
                                <div class="stat-item">
                                    <h4>Population</h4>
                                    <p>${stats.population}</p>
                                </div>
                            `
																: ""
														}
                            ${
															stats.area
																? `
                                <div class="stat-item">
                                    <h4>Area</h4>
                                    <p>${stats.area}</p>
                                </div>
                            `
																: ""
														}
                        </div>
                        ${stats.otherStats
													.map(
														(stat) => `
                            <div class="stat-item" style="grid-column: 1 / -1;">
                                <h4>${stat.label}</h4>
                                <p>${stat.value}</p>
                            </div>
                        `,
													)
													.join("")}
                        <div class="wikipedia-link">
                            <a href="https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle)}" target="_blank">
                                View full article on Wikipedia
                            </a>
                        </div>
                    `;
		} else {
			cityStatsDiv.innerHTML = `<p>No Wikipedia article found for ${cityName}.</p>`;
		}
	} catch (error) {
		cityStatsDiv.innerHTML = `<p class="error">Failed to fetch city statistics: ${error.message}</p>`;
	} finally {
		cityStatsBtn.disabled = false;
	}
}

// Function to get nearby restaurants using Overpass API
async function getNearbyRestaurants(lat, lon, radius) {
	// Overpass QL query to find restaurants within radius
	const query = `
                [out:json];
                (
                    node["amenity"="restaurant"](around:${radius},${lat},${lon});
                    way["amenity"="restaurant"](around:${radius},${lat},${lon});
                    relation["amenity"="restaurant"](around:${radius},${lat},${lon});
                );
                out center;
            `;

	const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

	try {
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`Overpass API error: ${response.status}`);
		}

		const data = await response.json();

		// Process elements and calculate distances
		return (
			data.elements
				.map((element) => {
					// Get coordinates (handles both nodes and ways/relations)
					const coords = element.center || {
						lat: element.lat,
						lon: element.lon,
					};

					// Calculate distance using Haversine formula
					const distance = calculateDistance(lat, lon, coords.lat, coords.lon);

					return {
						...element,
						distance,
					};
				})
				// Sort by distance
				.sort((a, b) => a.distance - b.distance)
		);
	} catch (error) {
		console.error("Overpass API error:", error);
		throw error;
	}
}

// Search Wikipedia for a term
async function searchWikipedia(searchTerm) {
	const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTerm)}&format=json&origin=*`;

	try {
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`Wikipedia API error: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error("Wikipedia search error:", error);
		throw error;
	}
}

// Get Wikipedia page content
async function getWikipediaPage(pageId) {
	const url = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&pageids=${pageId}&explaintext=true&format=json&origin=*`;

	try {
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`Wikipedia API error: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error("Wikipedia page fetch error:", error);
		throw error;
	}
}

// Extract city statistics from Wikipedia text
function extractCityStats(wikiData) {
	const result = {
		population: null,
		area: null,
		otherStats: [],
	};

	if (!wikiData.query || !wikiData.query.pages) {
		return result;
	}

	const page = Object.values(wikiData.query.pages)[0];
	if (!page || !page.extract) {
		return result;
	}

	const text = page.extract;

	// Try to find population
	const populationMatch = text.match(/population\s*[^0-9]*([0-9,]+)/i);
	if (populationMatch) {
		result.population = populationMatch[1].replace(/,/g, ",");
	}

	// Try to find area
	const areaMatch = text.match(
		/area\s*[^0-9]*([0-9,.]+)\s*(sq|square)?\s*(mi|km|miles|kilometers)/i,
	);
	if (areaMatch) {
		result.area =
			`${areaMatch[1]} ${areaMatch[3] || areaMatch[2] || ""}`.trim();
	}

	// Look for other common statistics
	const commonStats = [
		{
			regex: /elevation\s*[^0-9]*([0-9,.]+)\s*(m|ft|meters|feet)/i,
			label: "Elevation",
		},
		{
			regex: /density\s*[^0-9]*([0-9,.]+)\s*\/\s*(sq|square)?\s*(mi|km)/i,
			label: "Density",
		},
		{ regex: /time\s*zone\s*([^\n]+)/i, label: "Time Zone" },
		{ regex: /founded\s*([^\n]+)/i, label: "Founded" },
	];

	commonStats.forEach((stat) => {
		const match = text.match(stat.regex);
		if (match) {
			result.otherStats.push({
				label: stat.label,
				value:
					match[1] +
					(match[2] ? " " + match[2] : "") +
					(match[3] ? match[3] : ""),
			});
		}
	});

	return result;
}
