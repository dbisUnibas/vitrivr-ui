const cineastHost = "api.php";
const thumbnailHost = "thumbnails/";
const videoHost = "collection/";
const thumbnailFileType = "jpg";
const maxFrameGap = 250;
const showCategoryWeights = true;
const categoryConfig = {
	globalcolor:{displayName: "Global Color", defaultValue: 0.1, queryOrder: 1},
	localcolor:{displayName: "Local Color", defaultValue: 0.6, queryOrder: 3},
	edge:{displayName: "Edge", defaultValue: 0.3, queryOrder: 2},
	motion:{displayName: "Motion", defaultValue: 0, queryOrder: 4}
};