import supabase from "./supabase";

export async function getRecords() {
    let { data: User, error } = await supabase
        .from('User')
        .select('*');
    if (error) {
        throw new Error("Failed to fetch records");
    }
    return User; // Return the fetched records
}

export async function addRecords(username, password, userType, emailAddress) {
    if (!["participant", "facilitator"].includes(userType)) {
        throw new Error("Invalid user type. Must be 'participant' or 'facilitator'.");
    }

    const { error } = await supabase
        .from('User')
        .insert([
            { username, password, userType, emailAddress }, // Save emailAddress along with other fields
        ]);
    if (error) {
        console.error("Error adding record:", error); // Log the error for debugging
        throw new Error("Failed to add record");
    }
}

export async function deleteRecords(id) {
    const { error } = await supabase
        .from('User') // Ensure the table name matches
        .delete()
        .eq('id', id); // Use the provided id
    if (error) {
        throw new Error("Failed to delete record");
    }
}

export async function getUserInformation(userID) {
    const { data, error } = await supabase
        .from('userInformation')
        .select('*')
        .eq('userID', userID)
        .single();
    if (error) {
        throw new Error("Failed to fetch user information");
    }
    return data;
}

export async function upsertUserInformation(info) {
    let error, data;
    const payload = {
        userID: info.userID,
        firstName: info.firstName,
        middleInitial: info.middleInitial,
        lastName: info.lastName,
        participantType: info.participantType,
        age: info.age,
        gender: info.gender,
        contactNo: info.contactNo,
        imagepath: info.imagepath,
    };
    if (info.id) {
        ({ error } = await supabase
            .from('userInformation')
            .update(payload)
            .eq('id', info.id));
    } else {
        const result = await supabase
            .from('userInformation')
            .insert([payload])
            .select()
            .single();
        error = result.error;
        data = result.data;
    }
    if (error) {
        throw new Error("Failed to save user information");
    }
    return data;
}

export async function uploadProfileImage(localFileOrUri, filename) {
    let file;
    if (typeof window !== "undefined" && window.File && localFileOrUri instanceof File) {
        file = localFileOrUri;
    } else {
        const response = await fetch(localFileOrUri);
        file = await response.blob();
    }

    filename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");

    const { data, error } = await supabase.storage
        .from('images')
        .upload(filename, file, { upsert: true });

    if (error) {
        console.error("Supabase Storage upload error:", error);
        throw new Error("Failed to upload image");
    }

    const { data: publicUrlData } = supabase
        .storage
        .from('images')
        .getPublicUrl(filename);

    return publicUrlData.publicUrl;
}