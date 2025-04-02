# Discord Biolink with Lanyard API

A stylish biolink page that displays your Discord presence using the Lanyard API. This page shows your Discord status, current activities, Spotify listening status, and custom links.

## Features

- Real-time Discord status updates
- Spotify integration showing current song
- Discord activities display
- Customizable social media links
- Responsive design for all devices
- Modern, Discord-inspired UI

## Setup Instructions

1. **Clone this repository**

2. **Update your Discord ID**
   
   Open `script.js` and replace the placeholder Discord ID with your actual Discord ID:
   ```javascript
   const DISCORD_ID = 'YOUR_DISCORD_ID_HERE';
   ```

3. **Customize your links**
   
   Edit the links section in `index.html` to add your own social media links:
   ```html
   <div class="links-container">
       <a href="YOUR_LINK_HERE" class="link-item">
           <i class="fab fa-github"></i>
           <span>GitHub</span>
       </a>
       <!-- Add more links as needed -->
   </div>
   ```

4. **Join Lanyard Discord Server**
   
   For the Lanyard API to track your Discord presence, you need to join the [Lanyard Discord server](https://discord.gg/lanyard).

5. **Host your biolink**
   
   Upload the files to any web hosting service of your choice (GitHub Pages, Vercel, Netlify, etc.).

## Customization

- **Colors**: Edit the CSS variables in `styles.css` to change the color scheme
- **Layout**: Modify the HTML structure in `index.html` to add or remove sections
- **Fonts**: Change the Google Fonts import in `index.html` to use different fonts

## Credits

- [Lanyard API](https://github.com/Phineas/lanyard) - For Discord presence data
- [Font Awesome](https://fontawesome.com/) - For icons
- [Google Fonts](https://fonts.google.com/) - For typography

## License

This project is open source and available under the MIT License.