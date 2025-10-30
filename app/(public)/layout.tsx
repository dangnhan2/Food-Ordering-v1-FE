const PublicLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div>
            <h1>Public Layout</h1>
            {children}
        </div>
    )
}

export default PublicLayout