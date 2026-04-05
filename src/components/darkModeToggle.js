function DarkModeToggle() {
    const toggleDarkMode = () => {
        const isDark =
        document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    };

    return (
        <button
            onClick={toggleDarkMode}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded"
        >
            Dark Mode
        </button>
    );
}

export default DarkModeToggle;