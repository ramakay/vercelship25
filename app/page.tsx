import EnvironmentValidator from './components/EnvironmentValidator';
import ShowdownAnimePage from './page-client';

export default function Page() {
  return (
    <>
      <EnvironmentValidator />
      <ShowdownAnimePage />
    </>
  );
}