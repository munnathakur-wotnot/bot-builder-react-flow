export const getIdForKnowError = ({ type, validateData, id, nodeData }) => {
  if (type === "field") {
    const errorsFileds = validateData?.[nodeData.id] ?? [];
    const getId = errorsFileds?.find((item) => item?.fields_label);
    console.log(getId, "GetId", id);

    if (getId?.fields_label?.[id]) {
      return true;
    } else {
      return false;
    }
  } else if (type === "node") {
    const errorsFileds = validateData?.[nodeData.id] ?? [];
    const getId = errorsFileds?.find(
      (item) => item?.cards_title || item?.cards_buttons_title,
    );

    if (getId?.cards_title?.[id] || getId?.cards_buttons_title?.[id]) {
      return true;
    } else {
      return false;
    }
  }
};
