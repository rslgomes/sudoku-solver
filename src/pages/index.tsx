import Grid from '../components/Grid'
import GridInput from '../components/GridInput'
import { GridProvider } from '../contexts/GridContext'
import MainLayout from '../layouts/MainLayout'

const MainPage = () => {
    return (
        <>
            <GridProvider>
                <MainLayout>
                    <aside className="lg:w-1/3 lg:min-w-48">
                        <GridInput />
                    </aside>
                    <main className="w-full h-full flex items-center justify-center py-8">
                        <Grid />
                    </main>
                </MainLayout>
            </GridProvider>
        </>
    )
}

export default MainPage
