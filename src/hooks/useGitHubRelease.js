import { useState, useEffect } from 'react';

export function useGitHubRelease(owner, repo) {
    const [release, setRelease] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!owner || !repo) return;

        const fetchRelease = async () => {
            try {
                setLoading(true);
                const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`);

                if (!response.ok) {
                    throw new Error('Failed to fetch release data');
                }

                const data = await response.json();
                setRelease(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRelease();
    }, [owner, repo]);

    return { release, loading, error };
}
