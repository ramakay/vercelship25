import EnvironmentValidator from './components/EnvironmentValidator';
import ShowdownAnimePage from './page';

export default function PageWrapper() {
  return (
    <>
      <EnvironmentValidator />
      <ShowdownAnimePage />
    </>
  );
}