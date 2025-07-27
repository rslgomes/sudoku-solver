import Grid from '../components/Grid'
import GridInput from '../components/GridInput'
import { GridProvider } from '../contexts/GridContext'
import AsidePanel from '../layouts/AsidePanel'
import MainLayout from '../layouts/MainLayout'

const MainPage = () => {
  return (
    <>
      <GridProvider>
        <MainLayout>
          <AsidePanel>
            <GridInput />
          </AsidePanel>
          <main className="w-full h-full flex items-center justify-center py-8">
            <Grid />
          </main>
        </MainLayout>
      </GridProvider>
    </>
  )
}

export default MainPage
