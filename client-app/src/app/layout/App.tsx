import Navbar from './NavBar';
import { observer } from 'mobx-react-lite';
import { Container } from 'semantic-ui-react';
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
import HomePage from '../../features/activities/home/HomePage';
import { ToastContainer } from 'react-toastify';
import { useStore } from '../stores/store';
import { useEffect } from 'react';
import LoadingComponent from './LoadingComponent';
import ModalContainer from '../common/modals/ModalContainer';

function App() {
  const location = useLocation()

  const { commonStore, userStore } = useStore();

  useEffect(() => {
    if(commonStore.token) {
      userStore.getUser().finally(() => commonStore.setAppLoaded())
    } else {
      commonStore.setAppLoaded()
    }
  }, [commonStore, userStore])

  if(!commonStore.appLoaded) return <LoadingComponent content='Loading app...' />

  return (
    <>
    <ScrollRestoration />
    <ModalContainer />
    <ToastContainer position='bottom-right' hideProgressBar theme="colored" />
      {location.pathname === '/' ? <HomePage /> : (
        <>
          <Navbar />
          <Container style={{ marginTop: '7em' }}>
            <Outlet />
          </Container>
        </>
      )}
    </>
  )
}

export default observer(App)