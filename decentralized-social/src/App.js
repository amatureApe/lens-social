import { useEffect, useState } from 'react';
import {
  urlClient,
  LENS_HUB_CONTRACT_ADDRESS,
  queryRecommendedProfiles,
  queryExplorePublications
} from './queries';
import LENSHUB from './lenshub';
import { ethers } from 'ethers';
import { Box, Button, Image } from "@chakra-ui/react"

function App() {
  const [account, setAccount] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [posts, setPosts] = useState([]);

  async function signIn() {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts"
    });
    setAccount(accounts[0]);
  }

  async function getRecommendedProfiles() {
    const response = await urlClient.query(queryRecommendedProfiles).toPromise();
    const profiles = response.data.recommendedProfiles.slice(0, 5);
    setProfiles(profiles);
  }

  async function getPosts() {
    const response = await urlClient.query(queryExplorePublications).toPromise();
    const posts = response.data.explorePublications.items.filter((post) => {
      if (post.profile) return post;
      return "";
    });
    setPosts(posts);
  }

  async function follow(id) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(
      LENS_HUB_CONTRACT_ADDRESS,
      LENSHUB,
      provider.getSigner()
    );
    const tx = await contract.follow([parseInt(id)], [0x0]);
    await tx.wait();
  }

  useEffect(() => {
    getRecommendedProfiles();
    getPosts();
  }, []);

  const parseImageUrl = (post) => {
    if (post.profile) {
      const url = post.profile.picture?.original?.url;
      if (url && url.startsWith("ipfs:")) {
        const ipfsHash = url.split("//")[1];
        return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      }

      return url;
    }

    return "/default-avatar.png";
  }

  return (
    <div className="app">
      <Box width="100%" backgroundColor="rgba(5, 32, 64, 28)">
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          width="55%"
          margin="auto"
          color="white"
          padding="10px 0"
        >
          <Box>
            <Box fontFamily="DM Serif Display" fontSize="44px" fontStyle="italic">
              DECENTRA
            </Box>
            <Box> Decentralized Social Media App</Box>
          </Box>
          {account ? (
            <Box backgroundColor="000" padding="15px" borderRadius="6px">
              Connected
            </Box>
          ) : (
            <Button onClick={signIn} color="rgba(5, 32, 64)" _hover={{ backgroundColor: "#808080" }}>
              Connect
            </Button>
          )}
        </Box>
      </Box>
      {/* CONTENT */}
      <Box
        display="flex"
        justifyContent="space-between"
        width="55%"
        margin="35px auto auto auto"
        color="white"
      >
        {/* POSTS */}
        <Box width="65%" maxWidth="65%" minWidth="65%">
          {posts.map((post) => (
            <Box
              key={post.id}
              marginBottom="25px"
              backgroundColor="rgba(5, 32, 64, 28)"
              padding="40px 30px 40px 25px"
              borderRadius="6px"
            >
              <Box display="flex">
                {/* PROFILE IMAGE */}
                <Box width="75px" height="75px" marginTop="8px">
                  <img
                    alt="profile"
                    src={parseImageUrl(post)}
                    width="75px"
                    height="75px"
                    onError={({ currentTarget }) => {
                      currentTarget.onerror = null; // prevents looping
                      currentTarget.src = "/default-avatar.png";
                    }}
                  />
                </Box>

                {/*POST CONTENT */}
                <Box flexGrow={1} marginLeft="20px">
                  <Box display="flex" justifyContent="space-between">
                    <Box fontFamily="DM Serif Display" fontSize="24px">
                      {post.profile?.handle}
                    </Box>
                    <Box height="50px" _hover={{ cursor: "pointer" }}>
                      <Image
                        alt="follow-icon"
                        src="/follow-icon.png"
                        height="50px"
                        width="50px"
                        onClick={() => follow(post.id)}
                      />
                    </Box>
                  </Box>
                  <Box overflowWrap="anywhere" fontsize="14px">
                    {post.metadata?.content}
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>

        {/* FRIEND SUGGESTIONS */}
        <Box></Box>
      </Box>
    </div>
  );
}

export default App;
