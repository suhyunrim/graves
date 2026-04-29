export default function getApiErrorMessage(err, fallback) {
	return err?.response?.data?.result || fallback;
}
