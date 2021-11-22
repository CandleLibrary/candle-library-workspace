export default {
    endpoint_mapper: (uri) => {
        if (uri.ext == "wick")
            return uri + "";
    }
}