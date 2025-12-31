import { useState, useEffect } from 'react';
import './RichTextField.css';

interface RichTextFieldProps {
    value: string;
    onChange: (value: string) => void;
    label: string;
    rows?: number;
}

const FONTS = [
    { label: 'System Default', value: '' },
    { label: 'Montserrat (Modern)', value: 'Montserrat' },
    { label: 'League Spartan (Bold)', value: 'League Spartan' },
    { label: 'Poppins (Friendly)', value: 'Poppins' },
    { label: 'Playfair Display (Elegant)', value: 'Playfair Display' },
    { label: 'Dancing Script (Cursive)', value: 'Dancing Script' },
    { label: 'Great Vibes (Signature)', value: 'Great Vibes' },
    { label: 'Pacifico (Fun)', value: 'Pacifico' },
    { label: 'Rustic Roadway (Rustic)', value: 'Rustic Roadway' },
];

const SIZES = [
    { label: 'Default', value: '' },
    { label: 'Small (14px)', value: '14px' },
    { label: 'Medium (16px)', value: '16px' },
    { label: 'Large (18px)', value: '18px' },
    { label: 'XL (24px)', value: '24px' },
    { label: 'XXL (36px)', value: '36px' },
    { label: 'Huge (48px)', value: '48px' },
];

const WEIGHTS = [
    { label: 'Normal', value: '400' },
    { label: 'Medium', value: '500' },
    { label: 'Semi Bold', value: '600' },
    { label: 'Bold', value: '700' },
];

export default function RichTextField({ value, onChange, label, rows = 3 }: RichTextFieldProps) {
    // Basic rich text simulation: we wrap content in a span if it has styles
    // Or we just store the metadata if it's a specialized field?
    // User asked for "custom font option... below every text field"

    // For this implementation, we will assume standard text input BUT with formatting options
    // that wrap the output in HTML tags if modified.

    // Regex to parse existing styles? Too complex for 100% accuracy on raw HTML.
    // Simpler approach: Maintain state for the current block.

    const [text, setText] = useState(value);
    const [styles, setStyles] = useState({
        fontFamily: '',
        fontSize: '',
        fontWeight: '',
        fontStyle: ''
    });

    // Try to parse initial value to see if it has inline styles
    useEffect(() => {
        if (value.startsWith('<span style="')) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(value, 'text/html');
            const span = doc.body.firstChild as HTMLElement;
            if (span && span.style) {
                setStyles({
                    fontFamily: span.style.fontFamily.replace(/['"]/g, ''),
                    fontSize: span.style.fontSize,
                    fontWeight: span.style.fontWeight,
                    fontStyle: span.style.fontStyle
                });
                setText(span.textContent || '');
                return;
            }
        }
        // If regular text or complex HTML we can't parse easily
        if (!value.startsWith('<span')) {
            setText(value);
        }
    }, []);

    const handleChange = (newText: string, newStyles: typeof styles) => {
        setText(newText);
        setStyles(newStyles);

        // Construct output
        // If all styles are default, just return text
        const hasStyles = newStyles.fontFamily || newStyles.fontSize || newStyles.fontWeight || newStyles.fontStyle;

        if (!hasStyles) {
            onChange(newText);
        } else {
            const styleString = Object.entries(newStyles)
                .filter(([_, v]) => v) // only include set values
                .map(([k, v]) => {
                    const cssKey = k.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
                    return `${cssKey}:${v}`;
                })
                .join(';');

            onChange(`<span style="${styleString}">${newText}</span>`);
        }
    };

    return (
        <div className="rich-text-field">
            <label>{label}</label>
            <textarea
                value={text}
                onChange={(e) => handleChange(e.target.value, styles)}
                rows={rows}
                className="rich-input"
                style={{
                    fontFamily: styles.fontFamily,
                    fontSize: styles.fontSize,
                    fontWeight: styles.fontWeight,
                    fontStyle: styles.fontStyle
                }}
            />

            <div className="rich-toolbar">
                <select
                    value={styles.fontFamily}
                    onChange={(e) => handleChange(text, { ...styles, fontFamily: e.target.value })}
                >
                    {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>

                <select
                    value={styles.fontSize}
                    onChange={(e) => handleChange(text, { ...styles, fontSize: e.target.value })}
                    style={{ width: '80px' }}
                >
                    {SIZES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>

                <select
                    value={styles.fontWeight}
                    onChange={(e) => handleChange(text, { ...styles, fontWeight: e.target.value })}
                    style={{ width: '100px' }}
                >
                    {WEIGHTS.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                </select>

                <button
                    type="button"
                    className={`rich-btn ${styles.fontStyle === 'italic' ? 'active' : ''}`}
                    onClick={() => handleChange(text, { ...styles, fontStyle: styles.fontStyle === 'italic' ? '' : 'italic' })}
                    title="Italic"
                >
                    <i>I</i>
                </button>
            </div>
        </div>
    );
}
