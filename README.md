# Kitchen Inventory System

An AI-powered kitchen inventory management and recipe generation application built with Next.js.

## Features

- **Inventory Management**: Track food items with categories, quantities, and expiry dates
- **Equipment Management**: Manage kitchen equipment separately from food items
- **Recipe Generation**: Create recipes based on available ingredients using AI
- **Image Recognition**: Add items to inventory by uploading images
- **AI-Powered Categorization**: Automatically categorize items and recommend equipment

## Screenshots

![Kitchen Inventory System](screenshots/main-screen.png)

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **AI Integration**: OpenAI GPT-4 API
- **Image Upload**: UploadThing

## Documentation

- [Technical Documentation](documentation/technical-documentation.md)
- [API Documentation](documentation/api-documentation.md)
- [User Guide](documentation/user-guide.md)

## Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI API Key

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/kitchen-inventory-system.git
   cd kitchen-inventory-system
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   ```
   cp .env.example .env.local
   ```
   Then edit `.env.local` to add your OpenAI API key and other configuration.

4. Set up the database:
   ```
   npx prisma generate
   npx prisma db push
   ```

5. Start the development server:
   ```
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

See the [User Guide](documentation/user-guide.md) for detailed instructions on how to use the application.

## Deployment

This application can be deployed to Vercel or any other Next.js-compatible hosting platform.

```
npm run build
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [OpenAI](https://openai.com/)
- [Prisma](https://prisma.io/)
- [UploadThing](https://uploadthing.com/) 