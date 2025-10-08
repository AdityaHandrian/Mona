# MONA Color System

## Growth Green Color Palette

You can now use growth green colors throughout the application with these Tailwind classes:

### Primary Growth Green
- `bg-growth-green-500` - Main growth green (#058743)
- `text-growth-green-500` - Text color
- `border-growth-green-500` - Border color

### Growth Green Shades
- `bg-growth-green-50` - Lightest (#f0f9f4)
- `bg-growth-green-100` - Very light (#dcf2e3)
- `bg-growth-green-200` - Light (#bbe5c9)
- `bg-growth-green-300` - Medium light (#8fd1a4)
- `bg-growth-green-400` - Medium (#5bb377)
- `bg-growth-green-500` - **Main growth green** (#058743)
- `bg-growth-green-600` - Medium dark (#047a3b)
- `bg-growth-green-700` - Dark (#046830)
- `bg-growth-green-800` - Very dark (#045428)
- `bg-growth-green-900` - Darkest (#034521)

### Growth Green Light (Secondary)
- `bg-growth-green-light` - Secondary/hover green (#6FB386)

## Usage Examples

```jsx
// Buttons
<button className="bg-growth-green-500 hover:bg-growth-green-600 text-white">
  Primary Button
</button>

// Backgrounds
<div className="bg-growth-green-50 border border-growth-green-200">
  Light green background
</div>

// Text
<h1 className="text-growth-green-500">Growth Green Title</h1>

// Hover states
<div className="hover:bg-growth-green-light transition-colors">
  Hover for light green
</div>
```

## Migration from Old Colors

Replace these old color references:
- `bg-green-600` → `bg-growth-green-500`
- `hover:bg-green-700` → `hover:bg-growth-green-600`
- `text-green-600` → `text-growth-green-500`
- `bg-[#058743]` → `bg-growth-green-500`
- `bg-[#6FB386]` → `bg-growth-green-light`