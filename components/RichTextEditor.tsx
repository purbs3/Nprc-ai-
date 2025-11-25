import React, { useRef, useEffect } from 'react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
    const editorRef = useRef<HTMLDivElement>(null);

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    // This effect ensures that if the value is changed from outside (e.g., loading an existing post), the editor's content updates.
    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value;
        }
    }, [value]);

    // Although execCommand is deprecated, it remains the most straightforward, dependency-free
    // method for implementing simple rich-text functionality in modern browsers.
    const execCmd = (command: string) => {
        document.execCommand(command, false);
        editorRef.current?.focus();
        // We call handleInput to ensure the parent component's state is updated after the command.
        handleInput();
    };

    const toolbarButtonClasses = "px-3 py-1 text-sm font-semibold text-slate-200 hover:bg-slate-600 rounded-md transition-colors";

    return (
        <div className="bg-slate-700 rounded-lg focus-within:ring-2 focus-within:ring-cyan-500 border border-slate-600">
            <div className="toolbar flex items-center gap-2 p-2 border-b border-slate-600 flex-wrap">
                <button type="button" onClick={() => execCmd('bold')} className={toolbarButtonClasses}><b>Bold</b></button>
                <button type="button" onClick={() => execCmd('italic')} className={toolbarButtonClasses}><i>Italic</i></button>
                <button type="button" onClick={() => execCmd('insertUnorderedList')} className={toolbarButtonClasses}>List</button>
                <button type="button" onClick={() => execCmd('insertOrderedList')} className={toolbarButtonClasses}>Numbered List</button>
            </div>
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                className="w-full min-h-[256px] p-3 outline-none overflow-y-auto"
                // Initialize the editor with the provided HTML value
                dangerouslySetInnerHTML={{ __html: value }}
            />
        </div>
    );
};

export default RichTextEditor;
