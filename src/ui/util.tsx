import { GetClinicsWithOrderedProducts, Klinika } from "./types";

// export const turnUsersToClinics = (clinicsWithProducts:GetClinicsWithOrderedProducts, allClinics:Klinika[]) => {
//     const result = {...clinicsWithProducts}
//     for(const meal in clinicsWithProducts){
//         const filteredClinics:Klinika[] = [];
//         const key = meal as keyof typeof clinicsWithProducts;
//         if(clinicsWithProducts[key]?.clinics && clinicsWithProducts[key].clinics.length>0 ){
//             const clinicsNames:string[] = clinicsWithProducts[key].clinics;
//             clinicsNames.forEach(clinicName => {
//                 const filteredClinicsWithUser = allClinics.filter(klinikaObj => {
//                     const usersTitles = Object.values(klinikaObj.klinika);
//                     return usersTitles.includes(clinicName)
//                 })
//                 if(filteredClinicsWithUser && filteredClinicsWithUser[0] && !filteredClinics.some(fc => fc.id===filteredClinicsWithUser[0].id)){
//                     filteredClinics.push(filteredClinicsWithUser[0])
//                 }
//             })
//         }
//         result[key].clinicsObj = filteredClinics
//     }
// }


export const turnUsersToClinics = (
  clinicsWithProducts: GetClinicsWithOrderedProducts,
  allClinics: Klinika[]
) => {
    const result = { ...clinicsWithProducts };

    for (const meal in clinicsWithProducts) {
        const key = meal as keyof typeof clinicsWithProducts;
        const filteredClinics: Klinika[] = [];

        if (clinicsWithProducts[key]?.clinics?.length) {
            clinicsWithProducts[key].clinics.forEach(clinicName => {
                const found = allClinics.find(klinikaObj => {
                    return Object.values(klinikaObj.klinika).includes(clinicName);
                });

                if (found && !filteredClinics.some(fc => fc.id === found.id)) {
                    filteredClinics.push(found);
                }
            });
        }

        // ⚠️ you are ADDING a new property
        result[key].clinicsObj = filteredClinics;
    }

    return result; // ✅ THIS WAS MISSING
};

