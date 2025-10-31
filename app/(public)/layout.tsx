import Header from "@/components/Header";

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <Header />
            <main>{children}</main>
        </>
    )
}

export default PublicLayout