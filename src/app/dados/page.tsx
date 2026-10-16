import { DiceRollerPanel } from "@/components/dice/DiceRollerPanel";

const DicePage = () => (
  <div className="stack">
    <h1>Rolador de dados</h1>
    <DiceRollerPanel scope="avulso" />
  </div>
);

export default DicePage;
