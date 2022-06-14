import { useSelector } from "react-redux";
import Register from "../Register/Register";

const RegisterModal = () => {
  const register = useSelector((state) => state.IsRegistering);
  const isTeacher = useSelector((state) => state.IsTeacher.isTeacher);

  {
    if (register) {
      return <Register isTeacher={isTeacher} />;
    } else {
      return <h1>{isTeacher ? "log in teacher" : "login student"}</h1>;
    }
  }
};

export default RegisterModal;
