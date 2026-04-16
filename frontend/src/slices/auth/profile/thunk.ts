//Include Both Helper File with needed methods
import { getFirebaseBackend } from "../../../helpers/firebase_helper";
import { getMe, patchMeProfile, postFakeProfile } from "../../../helpers/fakebackend_helper";

// action
import { profileSuccess, profileError, resetProfileFlagChange } from "./reducer";

const fireBaseBackend : any = getFirebaseBackend();

export const editProfile = (user : any) => async (dispatch : any) => {
    try {
        let response;

        if (process.env.REACT_APP_DEFAULTAUTH === "firebase") {
            response = fireBaseBackend.editProfileAPI(
                user.first_name,
                user.idx
            );

        } else if (process.env.REACT_APP_DEFAULTAUTH === "jwt") {
            response = patchMeProfile({
                name: user.name ?? user.username ?? null,
                phone: user.phone ?? null,
                bio: user.bio ?? null,
                service_areas: user.service_areas ?? user.serviceAreas ?? null,
                avatar_url: user.avatar_url ?? user.avatarUrl ?? null,
            });

        } else if (process.env.REACT_APP_DEFAULTAUTH === "fake") {
            response = postFakeProfile(user);
        }

        const data = await response;

        if (data) {
            dispatch(profileSuccess(data));
        }

    } catch (error) {
        dispatch(profileError(error));
    }
};

export const resetProfileFlag = () => {
    try {
        const response = resetProfileFlagChange();
        return response;
    } catch (error) {
        return error;
    }
};

export const fetchMyProfile = () => async (dispatch: any) => {
    try {
        const data = await getMe();
        if (data) {
            dispatch(profileSuccess({ status: "success", data }));
        }
    } catch (error) {
        dispatch(profileError(error));
    }
};