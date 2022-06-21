import classes from "./MainSecCompTwo.module.css";
import { useSelector } from "react-redux";

const MainSecCompTwo = () => {
  const currentClass = useSelector((state) => state.CurrentClass.class);

  return (
    <article className={classes.article}>
      <p className={classes.p2}>Assignments:</p>
      <ul className={classes.ul}>
        {currentClass.assignments.map((item, index) => {
          return (
            <li key={index} className={classes.li}>
              {item}
            </li>
          );
        })}
      </ul>
    </article>
  );
};

export default MainSecCompTwo;
