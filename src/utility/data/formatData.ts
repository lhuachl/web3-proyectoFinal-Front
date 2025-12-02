const formatData = (data: Record<string, unknown>): string => {
    return JSON.stringify(data, null, 2);
};

export default formatData;