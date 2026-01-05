import React from 'react';
import Markdown from 'react-markdown';
import './ReleaseNotesModal.css';

const ReleaseNotesModal = ({ isOpen, onClose, releaseNotes, tagName }) => {
    if (!isOpen) return null;

    return (
        <div className="release-notes-overlay" onClick={onClose}>
            <div className="release-notes-modal" onClick={(e) => e.stopPropagation()}>
                <button className="release-notes-close" onClick={onClose} aria-label="Close">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                <div className="release-notes-header">
                    <h2>Notas de la Versión</h2>
                    {tagName && <span className="release-tag">{tagName}</span>}
                </div>

                <div className="release-notes-content">
                    {releaseNotes ? (
                        <Markdown>{releaseNotes}</Markdown>
                    ) : (
                        <p>No hay notas de versión disponibles.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReleaseNotesModal;
