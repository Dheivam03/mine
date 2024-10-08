import {
	Avatar,
	Box,
	Button,
	Divider,
	Flex,
	GridItem,
	Image,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalOverlay,
	VStack,
	useDisclosure,
} from "@chakra-ui/react";
import { AiFillHeart } from "react-icons/ai"
import { FaComment } from "react-icons/fa"
import { PostFooter } from "../FeedPost/PostFooter";
import Comments from "./Comments";
import useAuthStore from "../../store/authStore";
import Caption from "./Caption";
import useUserProfileStore from "../../store/userProfileStore";
import useShowToast from "../../hooks/useShowToast";
import usePostStore from "../../store/postStore";
import { useState } from "react";
import { MdDelete } from "react-icons/md";
import { arrayRemove, deleteDoc, doc, updateDoc } from "firebase/firestore";
// import { ref } from "firebase/database";
import { firestore, storage } from "../../Firebase/Firebase";
import { deleteObject,ref } from "firebase/storage";


const ProfilePost = ({ post }) => {
	const{ userProfile } = useUserProfileStore()
	const { user } = useAuthStore()
	const { isOpen, onOpen, onClose } = useDisclosure();
	const showToast = useShowToast();
	const [isDeleting, setIsDeleting] = useState(false);
	const deletePost = usePostStore((state) => state.deletePost);
	const decrementPostsCount = useUserProfileStore((state) => state.deletePost);

	const handleDeletePost = async () => {
		if (!window.confirm("Are you sure you to delete this post?")) return;
		if (isDeleting) return;

		try {
			console.log(post.id)
			const imageRef = ref(storage, `posts/${post.id}`);
			await deleteObject(imageRef);
			const userRef = doc(firestore, "users", user.uid);
			await deleteDoc(doc(firestore, "posts", post.id));

			await updateDoc(userRef, {
				posts: arrayRemove(post.id),
			});

			deletePost(post.id);
			decrementPostsCount(post.id);
			showToast("Success", "Post deleted successfully", "success");
		} catch (error) {
			showToast("Error", error.message, "error");
			console.log(error.message)
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<>
			<GridItem
				cursor={"pointer"}
				borderRadius={4}
				overflow={"hidden"}
				border={"1px solid"}
				borderColor={"whiteAlpha.300"}
				position={"relative"}
				aspectRatio={1 / 1}
				onClick={onOpen}
			>
				<Flex
					opacity={0}
					_hover={{ opacity: 1 }}
					position={"absolute"}
					top={0}
					left={0}
					right={0}
					bottom={0}
					bg={"blackAlpha.700"}
					transition={"all 0.3s ease"}
					zIndex={1}
					justifyContent={"center"}
				>
					<Flex alignItems={"center"} justifyContent={"center"} gap={50}>
						<Flex>
							<AiFillHeart size={20} />
							<Box fontWeight={"bold"} ml={2}>
								{post.likes.length}
							</Box>
						</Flex>

						<Flex>
							<FaComment size={20} />
							<Box fontWeight={"bold"} ml={2}>
								{post.comments.length}
							</Box>
						</Flex>
					</Flex>
				</Flex>

				<Image src={post.imageURL} objectFit='cover' alt='profile post' w={"100%"} h={"100%"} />
			</GridItem>
			<Modal isOpen={isOpen} onClose={onClose} isCentered={true} size={{ base: "3xl", md: "5xl" }}>
				<ModalOverlay />
				<ModalContent>
					<ModalCloseButton />
					<ModalBody bg={"black"} pb={5}>
						<Flex
							gap='4'
							w={{ base: "90%", sm: "70%", md: "full" }}
							mx={"auto"}
							maxH={"90vh"}
							minH={"50vh"}
						>
							<Flex
								borderRadius={4}
								overflow={"hidden"}
								border={"1px solid"}
								borderColor={"whiteAlpha.300"}
								flex={1.5}
								justifyContent={"center"}
								alignItems={"center"}
							>
								<Image src={post.imageURL} alt='profile post' />
							</Flex>
							<Flex flex={1} flexDir={"column"} px={10} display={{ base: "none", md: "flex" }} >
								<Flex alignItems={"center"} justifyContent={"space-between"}>
									<Flex alignItems={"center"} gap={4}>
										<Avatar src={userProfile.profilePicURL} size={"sm"} name='As a Programmer' />
										<Box fontWeight={"bold"} fontSize={12}>
											{userProfile.username}
										</Box>
									</Flex>
									{user?.uid === userProfile.uid && (
										<Button
											size={"sm"}
											bg={"transparent"}
											_hover={{ bg: "whiteAlpha.300", color: "red.600" }}
											borderRadius={4}
											p={1}
											onClick={handleDeletePost}
											isLoading={isDeleting}
										>
											<MdDelete size={20} cursor='pointer' />
										</Button>
									)}

								</Flex>
								<Divider my={4} bg={"gray.500"} />

								<VStack w='full' alignItems={"start"} maxH={"350px"} overflowY={"auto"}>
									{/* <Comments
										username='asaprogramer_'
										postedAt='5h ago'
										profilePic='./img1.png'
										text='just awesome'
									/> */}
									{post.caption && <Caption post={post} />}
									{ post.comments.map((comment,id) => (
										<Comments comment={comment} key={id}
										/>
									))}
								</VStack>
								<PostFooter isProfilePage='true' post={post} creatorProfile={user} />
							</Flex>
						</Flex>
					</ModalBody>

				</ModalContent>
			</Modal>
		</>
	)
}

export default ProfilePost

