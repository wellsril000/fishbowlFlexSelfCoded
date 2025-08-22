# Fishbowl Flex - Data Migration Tool

A modern web application built with React and TypeScript to streamline data migration workflows. This tool helps users upload, preview, and process data files for migration projects.

## Features

- **File Upload & Validation**: Support for CSV, Excel (.xlsx, .xlsm) files
- **Data Preview**: Interactive table view with pagination (100 rows per page)
- **Responsive Design**: Modern UI built with Tailwind CSS
- **Navigation**: Intuitive workflow with back/next navigation
- **File Information**: Display file details including row count and column count

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Styling**: Tailwind CSS v4
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **Package Manager**: npm

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm (comes with Node.js)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/fishbowl-flex-frontend.git
   cd fishbowl-flex-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.tsx      # Navigation bar
│   ├── FileUploadBox.tsx # File upload component
│   └── Button.tsx      # Button component
├── pages/              # Page components
│   ├── HomePage.tsx    # Main landing page
│   └── preview.tsx     # File preview page
├── assets/             # Static assets
└── App.tsx             # Main application component
```

## Usage

1. **Upload a File**: Click "Choose File" and select a CSV or Excel file
2. **Preview Data**: Review your data in the table format with pagination
3. **Navigate**: Use the Next button to proceed to the next step
4. **Go Back**: Use the Back button to return to previous steps

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Features

1. Create new components in the `components/` directory
2. Add new pages in the `pages/` directory
3. Update routing in `App.tsx` as needed
4. Follow the existing code style and patterns

## Contributing

This is a personal project for learning and workflow improvement. Feel free to fork and modify for your own needs.

## License

This project is open source and available under the [MIT License](LICENSE).

## Future Enhancements

- [ ] Excel file support (.xlsx, .xlsm)
- [ ] Data transformation tools
- [ ] Export functionality
- [ ] Advanced filtering and sorting
- [ ] Data validation rules
- [ ] Integration with external systems

## Contact

Built by Riley Wells for data migration workflow improvement and coding skill development.
