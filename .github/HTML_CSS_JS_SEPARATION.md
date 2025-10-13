# HTML, CSS, and JavaScript Separation Guide

## Table of Contents

- [Overview](#overview)
- [What is Separation of Concerns?](#what-is-separation-of-concerns)
- [The Three Pillars of Web Development](#the-three-pillars-of-web-development)
- [Benefits of Separation](#benefits-of-separation)
- [How to Separate in Practice](#how-to-separate-in-practice)
- [File Structure Recommendations](#file-structure-recommendations)
- [Practical Examples](#practical-examples)
- [Common Mistakes and Anti-Patterns](#common-mistakes-and-anti-patterns)
- [Best Practices](#best-practices)
- [Integration with Project Standards](#integration-with-project-standards)
- [References](#references)

## Overview

This guide explains the fundamental principle of separating HTML (structure), CSS (presentation), and JavaScript (behavior) in web development. Following these practices leads to more maintainable, reusable, and testable code.

### Why This Matters

- **Maintainability**: Changes to styling don't require touching JavaScript logic
- **Reusability**: Components can be reused across different contexts
- **Testability**: Logic can be tested independently from presentation
- **Collaboration**: Different team members can work on different aspects simultaneously
- **Performance**: Separation enables better caching and optimization strategies

## What is Separation of Concerns?

**Separation of Concerns (SoC)** is a design principle for separating a computer program into distinct sections, where each section addresses a separate concern. In web development, this means:

- **HTML** handles structure and content (What)
- **CSS** handles presentation and styling (How it looks)
- **JavaScript** handles behavior and interactivity (How it behaves)

### The Principle

> "Each technology should be used for what it does best, and concerns should not overlap."

When these technologies are properly separated:
- HTML remains semantic and accessible
- CSS is reusable and maintainable
- JavaScript is testable and focused on logic

## The Three Pillars of Web Development

### 1. HTML - Structure and Content

**Responsibility**: Define the structure and meaning of content.

**Characteristics**:
- Semantic markup (use appropriate tags: `<header>`, `<nav>`, `<article>`, etc.)
- Accessibility (ARIA attributes when needed)
- Content hierarchy
- No styling (no `style` attributes)
- No behavior (no inline `onclick` handlers)

**Example**:
```html
<!-- ✅ Good: Semantic, accessible structure -->
<article class="post">
  <header>
    <h1 class="post-title">Article Title</h1>
    <time datetime="2025-10-12">October 12, 2025</time>
  </header>
  <div class="post-content">
    <p>Article content goes here...</p>
  </div>
  <footer>
    <button class="share-btn" data-action="share">Share</button>
  </footer>
</article>
```

### 2. CSS - Presentation and Styling

**Responsibility**: Define how content should be visually presented.

**Characteristics**:
- Visual appearance (colors, fonts, spacing)
- Layout and positioning
- Responsive design (media queries)
- Animations and transitions
- No structural content
- No behavioral logic

**Example**:
```css
/* ✅ Good: Focused on presentation */
.post {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.post-title {
  color: #333;
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.share-btn {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.share-btn:hover {
  background-color: #0056b3;
}
```

### 3. JavaScript - Behavior and Interactivity

**Responsibility**: Define how the application responds to user interactions and manages dynamic content.

**Characteristics**:
- Event handling
- Data manipulation
- API communication
- Dynamic content updates
- Application logic
- No styling (avoid inline styles)
- No structural markup (avoid excessive DOM creation)

**Example**:
```javascript
// ✅ Good: Focused on behavior and logic
document.addEventListener('DOMContentLoaded', () => {
  const shareBtn = document.querySelector('.share-btn');
  
  shareBtn.addEventListener('click', () => {
    shareArticle();
  });
});

function shareArticle() {
  const title = document.querySelector('.post-title').textContent;
  const url = window.location.href;
  
  if (navigator.share) {
    navigator.share({
      title: title,
      url: url
    }).then(() => {
      console.log('Article shared successfully');
    }).catch(err => {
      console.error('Error sharing:', err);
    });
  } else {
    copyToClipboard(url);
    showNotification('Link copied to clipboard!');
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
}

function showNotification(message) {
  // Logic to display notification
  console.log(message);
}
```

## Benefits of Separation

### 1. Maintainability

**Without Separation**:
```html
<!-- ❌ Bad: Everything mixed together -->
<div style="color: red; padding: 10px;" onclick="alert('Clicked!')">
  Click me
</div>
```

**Problem**: To change the color, you must edit HTML. To change the behavior, you must edit HTML. Everything is coupled.

**With Separation**:
```html
<!-- ✅ Good: Separated concerns -->
<div class="alert-box">Click me</div>
```

```css
.alert-box {
  color: red;
  padding: 10px;
}
```

```javascript
document.querySelector('.alert-box').addEventListener('click', () => {
  alert('Clicked!');
});
```

**Benefit**: Change color in CSS, change behavior in JS, update content in HTML - independently.

### 2. Reusability

Separated styles and behaviors can be reused across different pages and components:

```css
/* Reusable button styles */
.btn {
  padding: 10px 20px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}

.btn-primary { background-color: #007bff; color: white; }
.btn-danger { background-color: #dc3545; color: white; }
```

```javascript
// Reusable button behavior
function initializeButtons(selector) {
  document.querySelectorAll(selector).forEach(btn => {
    btn.addEventListener('click', handleButtonClick);
  });
}
```

### 3. Readability

Separated code is easier to read and understand:

- **HTML files** show structure at a glance
- **CSS files** reveal visual design patterns
- **JavaScript files** expose application logic

### 4. Performance

**Caching**: Browsers can cache CSS and JavaScript files separately from HTML.

**Minification**: Each file type can be optimized independently:
- CSS can be minified and combined
- JavaScript can be minified, combined, and tree-shaken
- HTML can be compressed

**Loading**: Scripts can be loaded asynchronously without blocking HTML rendering:
```html
<script src="app.js" defer></script>
```

### 5. Testability

Separated JavaScript can be tested independently:

```javascript
// Pure function - easy to test
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Test
expect(calculateTotal([{price: 10}, {price: 20}])).toBe(30);
```

When logic is separated from DOM manipulation, you can test business logic without a browser.

## How to Separate in Practice

### External Files

**Always use external files** for CSS and JavaScript:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My App</title>
  
  <!-- ✅ External CSS -->
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <h1>Welcome</h1>
    <button id="actionBtn">Click Me</button>
  </div>
  
  <!-- ✅ External JavaScript -->
  <script src="script.js"></script>
</body>
</html>
```

### Use Classes and IDs for Targeting

```html
<!-- ✅ Good: Use classes for styling, IDs for JavaScript -->
<button id="submitBtn" class="btn btn-primary">Submit</button>
```

```css
/* Style using classes */
.btn {
  padding: 10px 20px;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}
```

```javascript
// Target using IDs or data attributes
const submitBtn = document.getElementById('submitBtn');
submitBtn.addEventListener('click', handleSubmit);
```

### Data Attributes for Configuration

Use `data-*` attributes to pass configuration to JavaScript without mixing concerns:

```html
<button 
  class="action-btn"
  data-action="save"
  data-item-id="123">
  Save
</button>
```

```javascript
document.querySelectorAll('.action-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const action = e.target.dataset.action;
    const itemId = e.target.dataset.itemId;
    performAction(action, itemId);
  });
});
```

### CSS Classes for State Changes

Use CSS classes to represent state, controlled by JavaScript:

```css
.modal { display: none; }
.modal.is-active { display: block; }

.button { background-color: blue; }
.button.is-disabled { 
  background-color: gray;
  cursor: not-allowed;
}
```

```javascript
function showModal() {
  document.querySelector('.modal').classList.add('is-active');
}

function disableButton(btn) {
  btn.classList.add('is-disabled');
  btn.disabled = true;
}
```

## File Structure Recommendations

### Small Projects

```
project/
├── index.html
├── styles.css
└── script.js
```

### Medium Projects

```
project/
├── index.html
├── css/
│   ├── main.css
│   ├── components.css
│   └── utilities.css
└── js/
    ├── app.js
    ├── utils.js
    └── api.js
```

### Large Projects (like Guia.js)

```
project/
├── index.html
├── css/
│   ├── base/
│   │   ├── reset.css
│   │   └── typography.css
│   ├── components/
│   │   ├── buttons.css
│   │   ├── forms.css
│   │   └── cards.css
│   └── layouts/
│       ├── grid.css
│       └── header.css
├── js/
│   ├── modules/
│   │   ├── GeolocationService.js
│   │   ├── AddressExtractor.js
│   │   └── PositionManager.js
│   ├── utils/
│   │   ├── helpers.js
│   │   └── validators.js
│   └── app.js
└── src/
    └── guia.js (main application)
```

## Practical Examples

### Example 1: Basic Form

#### HTML (Structure)
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contact Form</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <form id="contactForm" class="contact-form">
      <h1>Contact Us</h1>
      
      <div class="form-group">
        <label for="name">Name</label>
        <input type="text" id="name" name="name" required>
      </div>
      
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" name="email" required>
      </div>
      
      <div class="form-group">
        <label for="message">Message</label>
        <textarea id="message" name="message" rows="5" required></textarea>
      </div>
      
      <button type="submit" class="btn btn-primary">Send Message</button>
    </form>
  </div>
  
  <script src="script.js"></script>
</body>
</html>
```

#### CSS (Presentation)
```css
/* styles.css */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  background-color: #f5f5f5;
  padding: 20px;
}

.container {
  max-width: 600px;
  margin: 0 auto;
}

.contact-form {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.contact-form h1 {
  color: #333;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #555;
  font-weight: bold;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #007bff;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}
```

#### JavaScript (Behavior)
```javascript
// script.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  
  form.addEventListener('submit', handleFormSubmit);
});

function handleFormSubmit(event) {
  event.preventDefault();
  
  const formData = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    message: document.getElementById('message').value
  };
  
  if (validateForm(formData)) {
    sendFormData(formData);
  }
}

function validateForm(data) {
  if (!data.name || !data.email || !data.message) {
    alert('Please fill in all fields');
    return false;
  }
  
  if (!isValidEmail(data.email)) {
    alert('Please enter a valid email address');
    return false;
  }
  
  return true;
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function sendFormData(data) {
  console.log('Sending form data:', data);
  // API call logic here
  alert('Message sent successfully!');
}
```

### Example 2: From Guia.js Project

This example shows how Guia.js applies separation of concerns:

#### HTML (test.html)
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Guia.js - Teste de Geolocalização</title>
  <link rel="stylesheet" href="styles/test.css">
</head>
<body>
  <div class="container">
    <h1>Guia.js - Teste de Geolocalização</h1>
    <p>Aplicação de geolocalização para endereços brasileiros</p>
    
    <div class="button-group">
      <button id="location-btn" class="btn btn-primary">Obter Localização</button>
      <button id="restaurant-btn" class="btn btn-secondary">Encontrar Restaurantes</button>
      <button id="stats-btn" class="btn btn-secondary">Estatísticas da Cidade</button>
    </div>
    
    <div id="result-area" class="result-area">
      <p>Clique em "Obter Localização" para começar...</p>
    </div>
    
    <h3>Log de Atividades:</h3>
    <textarea id="activity-log" class="activity-log" readonly></textarea>
  </div>
  
  <script src="src/guia.js"></script>
  <script src="scripts/test-app.js"></script>
</body>
</html>
```

#### CSS (styles/test.css)
```css
/* Base styles */
body {
  font-family: Arial, sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f5f5;
}

/* Layout */
.container {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Buttons */
.btn {
  border: none;
  padding: 10px 20px;
  margin: 5px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

/* Components */
.result-area {
  margin-top: 20px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #f9f9f9;
  min-height: 100px;
}

.activity-log {
  width: 100%;
  height: 200px;
  margin-top: 20px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  background-color: #f8f8f8;
  overflow-y: auto;
  resize: vertical;
}
```

#### JavaScript (scripts/test-app.js)
```javascript
// Application initialization
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

function initializeApp() {
  const locationBtn = document.getElementById('location-btn');
  const restaurantBtn = document.getElementById('restaurant-btn');
  const statsBtn = document.getElementById('stats-btn');
  
  locationBtn.addEventListener('click', handleLocationRequest);
  restaurantBtn.addEventListener('click', handleRestaurantSearch);
  statsBtn.addEventListener('click', handleCityStats);
  
  logActivity('Application initialized');
}

function handleLocationRequest() {
  logActivity('Requesting geolocation...');
  
  if (!navigator.geolocation) {
    displayError('Geolocation not supported');
    return;
  }
  
  navigator.geolocation.getCurrentPosition(
    handlePositionSuccess,
    handlePositionError
  );
}

function handlePositionSuccess(position) {
  const coords = {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy
  };
  
  displayLocation(coords);
  logActivity(`Location obtained: ${coords.latitude}, ${coords.longitude}`);
}

function handlePositionError(error) {
  const errorMessage = getGeolocationErrorMessage(error);
  displayError(errorMessage);
  logActivity(`Error: ${errorMessage}`);
}

function getGeolocationErrorMessage(error) {
  switch(error.code) {
    case error.PERMISSION_DENIED:
      return 'User denied geolocation permission';
    case error.POSITION_UNAVAILABLE:
      return 'Location information unavailable';
    case error.TIMEOUT:
      return 'Location request timed out';
    default:
      return 'Unknown geolocation error';
  }
}

function displayLocation(coords) {
  const resultArea = document.getElementById('result-area');
  resultArea.innerHTML = `
    <h3>Location Found</h3>
    <p><strong>Latitude:</strong> ${coords.latitude}</p>
    <p><strong>Longitude:</strong> ${coords.longitude}</p>
    <p><strong>Accuracy:</strong> ${coords.accuracy}m</p>
  `;
}

function displayError(message) {
  const resultArea = document.getElementById('result-area');
  resultArea.innerHTML = `<p class="error">${message}</p>`;
}

function logActivity(message) {
  const log = document.getElementById('activity-log');
  const timestamp = new Date().toLocaleTimeString();
  log.value += `[${timestamp}] ${message}\n`;
  log.scrollTop = log.scrollHeight;
}

function handleRestaurantSearch() {
  logActivity('Restaurant search feature in development');
}

function handleCityStats() {
  logActivity('City statistics feature in development');
}
```

## Common Mistakes and Anti-Patterns

### ❌ Mistake 1: Inline Styles

```html
<!-- ❌ Bad: Inline styles -->
<div style="color: red; padding: 10px; margin: 5px;">
  Content
</div>
```

**Why it's bad**:
- Not reusable
- Hard to maintain
- Can't leverage CSS features (media queries, pseudo-classes)
- Increases HTML file size
- Harder to override

**✅ Solution**: Use external CSS with classes

```html
<div class="alert-message">Content</div>
```

```css
.alert-message {
  color: red;
  padding: 10px;
  margin: 5px;
}
```

### ❌ Mistake 2: Inline Event Handlers

```html
<!-- ❌ Bad: Inline JavaScript -->
<button onclick="alert('Clicked!')">Click Me</button>
```

**Why it's bad**:
- Mixes concerns (HTML + JavaScript)
- Not reusable
- Hard to test
- Violates Content Security Policy (CSP)
- Limited error handling

**✅ Solution**: Use event listeners in JavaScript

```html
<button id="myButton">Click Me</button>
```

```javascript
document.getElementById('myButton').addEventListener('click', () => {
  alert('Clicked!');
});
```

### ❌ Mistake 3: JavaScript-Generated Styles

```javascript
// ❌ Bad: Generating styles in JavaScript
element.style.backgroundColor = 'red';
element.style.padding = '10px';
element.style.margin = '5px';
```

**Why it's bad**:
- Mixes concerns (JavaScript + CSS)
- Hard to maintain
- Can't leverage CSS features
- Performance issues

**✅ Solution**: Use CSS classes

```javascript
// ✅ Good: Add CSS class
element.classList.add('alert-message');
```

```css
.alert-message {
  background-color: red;
  padding: 10px;
  margin: 5px;
}
```

### ❌ Mistake 4: Creating Large DOM Structures in JavaScript

```javascript
// ❌ Bad: Creating complex HTML in JavaScript
const html = `
  <div class="card">
    <div class="card-header">
      <h2>Title</h2>
    </div>
    <div class="card-body">
      <p>Content</p>
    </div>
  </div>
`;
container.innerHTML = html;
```

**Why it's bad**:
- Mixes concerns (JavaScript + HTML)
- Hard to maintain markup
- No syntax highlighting
- Hard to validate

**✅ Solution**: Use HTML templates or components

```html
<!-- HTML Template -->
<template id="card-template">
  <div class="card">
    <div class="card-header">
      <h2 class="card-title"></h2>
    </div>
    <div class="card-body">
      <p class="card-content"></p>
    </div>
  </div>
</template>
```

```javascript
// JavaScript - Use the template
function createCard(title, content) {
  const template = document.getElementById('card-template');
  const card = template.content.cloneNode(true);
  
  card.querySelector('.card-title').textContent = title;
  card.querySelector('.card-content').textContent = content;
  
  return card;
}
```

### ❌ Mistake 5: Using `<style>` Tags in HTML Body

```html
<!-- ❌ Bad: Style tag in body -->
<body>
  <style>
    .my-element { color: red; }
  </style>
  <div class="my-element">Content</div>
</body>
```

**Why it's bad**:
- Not reusable across pages
- Can cause FOUC (Flash of Unstyled Content)
- Hard to manage and maintain
- Not cacheable

**✅ Solution**: Use external CSS files in `<head>`

```html
<head>
  <link rel="stylesheet" href="styles.css">
</head>
```

## Best Practices

### 1. Keep HTML Semantic

Use appropriate HTML5 semantic elements:

```html
<!-- ✅ Good: Semantic HTML -->
<header>
  <nav>
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/about">About</a></li>
    </ul>
  </nav>
</header>

<main>
  <article>
    <h1>Article Title</h1>
    <p>Content...</p>
  </article>
</main>

<footer>
  <p>&copy; 2025 Company Name</p>
</footer>
```

### 2. Use BEM or Similar Naming Convention

BEM (Block Element Modifier) helps organize CSS classes:

```html
<div class="card">
  <h2 class="card__title">Title</h2>
  <p class="card__content">Content</p>
  <button class="card__button card__button--primary">Action</button>
</div>
```

```css
.card { /* Block */ }
.card__title { /* Element */ }
.card__content { /* Element */ }
.card__button { /* Element */ }
.card__button--primary { /* Modifier */ }
```

### 3. Progressive Enhancement

Build your application in layers:

1. **HTML**: Core content and functionality (works without CSS/JS)
2. **CSS**: Enhanced presentation (works without JS)
3. **JavaScript**: Enhanced interactivity (gracefully degrades)

```html
<!-- Works without JavaScript -->
<form action="/search" method="GET">
  <input type="text" name="q" required>
  <button type="submit">Search</button>
</form>
```

```javascript
// Enhances the form with AJAX if JavaScript is available
const form = document.querySelector('form');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  // AJAX submission
  fetchSearchResults(form.querySelector('input').value);
});
```

### 4. Use CSS Custom Properties for Theming

```css
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --spacing-unit: 8px;
  --border-radius: 4px;
}

.btn {
  padding: calc(var(--spacing-unit) * 1.25) calc(var(--spacing-unit) * 2.5);
  border-radius: var(--border-radius);
}

.btn-primary {
  background-color: var(--primary-color);
}
```

```javascript
// JavaScript can update CSS variables
document.documentElement.style.setProperty('--primary-color', '#ff6b6b');
```

### 5. Separate Concerns in JavaScript

Even within JavaScript, separate concerns:

```javascript
// ❌ Bad: Everything in one function
function handleClick() {
  const data = fetchData();
  const processed = processData(data);
  const html = createHTML(processed);
  updateDOM(html);
  trackAnalytics('click');
}

// ✅ Good: Separated concerns
async function handleClick() {
  try {
    const data = await fetchData();
    const processed = processData(data);
    updateUI(processed);
    trackEvent('button_click');
  } catch (error) {
    handleError(error);
  }
}

// Pure function - Data processing
function processData(data) {
  return data.filter(item => item.active)
             .map(item => ({ id: item.id, name: item.name }));
}

// Side effect - DOM update
function updateUI(data) {
  const container = document.getElementById('results');
  container.innerHTML = createResultsList(data);
}

// Pure function - Create markup
function createResultsList(items) {
  return items.map(item => 
    `<li data-id="${item.id}">${item.name}</li>`
  ).join('');
}

// Side effect - Analytics
function trackEvent(eventName) {
  console.log(`Tracking: ${eventName}`);
}

// Side effect - Error handling
function handleError(error) {
  console.error('Error:', error);
  showErrorMessage('Something went wrong');
}
```

### 6. Use Data Attributes for JavaScript Hooks

```html
<!-- ✅ Good: Use data attributes for JavaScript, classes for CSS -->
<button class="btn btn-primary" data-action="submit" data-form="contact">
  Submit
</button>
```

```css
/* Style with classes */
.btn { padding: 10px 20px; }
.btn-primary { background-color: blue; }
```

```javascript
// Select with data attributes
document.querySelectorAll('[data-action="submit"]').forEach(btn => {
  btn.addEventListener('click', () => {
    const formId = btn.dataset.form;
    submitForm(formId);
  });
});
```

### 7. Avoid Magic Numbers in CSS

```css
/* ❌ Bad: Magic numbers */
.element {
  padding: 17px;
  margin: 23px;
}

/* ✅ Good: Use CSS custom properties */
:root {
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
}

.element {
  padding: var(--spacing-md);
  margin: var(--spacing-lg);
}
```

### 8. Unobtrusive JavaScript

JavaScript should enhance, not be required:

```html
<!-- ✅ Links work without JavaScript -->
<a href="/page" class="ajax-link">View Page</a>
```

```javascript
// Enhance with AJAX if available
document.querySelectorAll('.ajax-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    loadPageViaAjax(link.href);
  });
});
```

## Integration with Project Standards

The principle of separating HTML, CSS, and JavaScript aligns with several key Guia.js project standards:

### Referential Transparency

When JavaScript is separated from HTML and CSS, it becomes easier to write pure functions:

```javascript
// ✅ Pure function - no DOM dependencies
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// ✅ Testable without DOM
expect(calculateDistance(-23.5505, -46.6333, -22.9068, -43.1729)).toBeCloseTo(357.6);
```

See: [REFERENTIAL_TRANSPARENCY.md](./REFERENTIAL_TRANSPARENCY.md)

### High Cohesion

Separation naturally leads to high cohesion:

- **HTML files** contain only structure
- **CSS files** contain only styles
- **JavaScript modules** contain focused logic

See: [HIGH_COHESION_GUIDE.md](./HIGH_COHESION_GUIDE.md)

### Low Coupling

Separated concerns reduce coupling:

```javascript
// ✅ Low coupling - accepts any DOM element
function attachClickHandler(element, handler) {
  element.addEventListener('click', handler);
}

// ✅ Can be used anywhere
const btn = document.getElementById('myButton');
attachClickHandler(btn, () => console.log('Clicked'));
```

See: [LOW_COUPLING_GUIDE.md](./LOW_COUPLING_GUIDE.md)

### Testability

Separated JavaScript enables comprehensive testing:

```javascript
// src/utils/validators.js - Pure, testable functions
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidBrazilianPhone(phone) {
  const phoneRegex = /^\(\d{2}\)\s?\d{4,5}-?\d{4}$/;
  return phoneRegex.test(phone);
}
```

```javascript
// __tests__/utils/validators.test.js
import { isValidEmail, isValidBrazilianPhone } from '../../src/utils/validators';

describe('Email Validation', () => {
  test('accepts valid email', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
  });
  
  test('rejects invalid email', () => {
    expect(isValidEmail('invalid-email')).toBe(false);
  });
});
```

See: [UNIT_TEST_GUIDE.md](./UNIT_TEST_GUIDE.md), [TDD_GUIDE.md](./TDD_GUIDE.md)

### Code Review

Code reviews become easier when concerns are separated:

- **HTML changes** can be reviewed for semantics and accessibility
- **CSS changes** can be reviewed for design consistency
- **JavaScript changes** can be reviewed for logic and testability

See: [CODE_REVIEW_GUIDE.md](./CODE_REVIEW_GUIDE.md)

## References

### Internal Documentation

- [REFERENTIAL_TRANSPARENCY.md](./REFERENTIAL_TRANSPARENCY.md) - Pure functions and testability
- [HIGH_COHESION_GUIDE.md](./HIGH_COHESION_GUIDE.md) - Single responsibility principle
- [LOW_COUPLING_GUIDE.md](./LOW_COUPLING_GUIDE.md) - Reducing dependencies
- [CODE_REVIEW_GUIDE.md](./CODE_REVIEW_GUIDE.md) - Code review standards
- [UNIT_TEST_GUIDE.md](./UNIT_TEST_GUIDE.md) - Unit testing best practices
- [TDD_GUIDE.md](./TDD_GUIDE.md) - Test-driven development workflow
- [JAVASCRIPT_BEST_PRACTICES.md](./JAVASCRIPT_BEST_PRACTICES.md) - JavaScript coding standards

### External Resources

- [MDN Web Docs - HTML](https://developer.mozilla.org/en-US/docs/Web/HTML) - HTML reference and guides
- [MDN Web Docs - CSS](https://developer.mozilla.org/en-US/docs/Web/CSS) - CSS reference and guides
- [MDN Web Docs - JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) - JavaScript reference and guides
- [Separation of Concerns](https://en.wikipedia.org/wiki/Separation_of_concerns) - Wikipedia article
- [Progressive Enhancement](https://developer.mozilla.org/en-US/docs/Glossary/Progressive_Enhancement) - MDN guide
- [BEM Methodology](http://getbem.com/) - CSS naming convention
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript) - JavaScript best practices

### Books

- *"HTML and CSS: Design and Build Websites"* by Jon Duckett
- *"JavaScript: The Good Parts"* by Douglas Crockford
- *"Don't Make Me Think"* by Steve Krug

---

**Author**: GitHub Copilot  
**Date**: 2025-10-12  
**Version**: 1.0.0

## License

This documentation is part of the Guia.js project and follows the same license terms.
