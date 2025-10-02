import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, ImageStyle } from 'expo-image';
import { router } from 'expo-router';
import { memo, useState } from 'react';
import { Dimensions, DimensionValue, FlatList, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import ImageModal from './ImageModal';

interface CarouselProps {
  images: string[];
  width?: DimensionValue | undefined;
  imageHeight?: DimensionValue | undefined;
  showNumber?: boolean;
  modal?: boolean;
  style?: ImageStyle;
  uri?: boolean;
}

const {width, height} = Dimensions.get('window')

// const platformTopBorder = Platform.OS == 'ios' ? 40: 0
const borderRadius = Platform.select({
    ios: width * 0.1, // iPhones typically have larger corner radii (10% of screen width)
    android: width * 0.05, // Android devices often have smaller or no corner radii
});

const ImageCarousel = ({ imageHeight, width, images, showNumber, modal, style, uri }: CarouselProps) => {
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0); // Track the clicked image index
  // console.log('io',images)
  
  return (
    <>
      <View style={{ borderTopRightRadius: 0, position: 'relative', borderTopStartRadius: 0 }}>
        <FlatList
          scrollEventThrottle={16}
          data={images}
          renderItem={({ item, index }) => (
            <View>
              <Pressable
                onPress={() => {
                  if (modal) {
                    setSelectedImageIndex(index); // Set the clicked image index
                    setShowImageModal(true);
                  } else {
                    router.push('/(guest)/(modals)/listing/[listing]');
                  }
                }}
                style={{
                  borderTopLeftRadius: showNumber ? borderRadius : 12,
                  borderTopRightRadius: showNumber ? borderRadius : 12,
                  width, overflow: 'hidden'
                }}
              >
                <Image
                  source={uri ? { uri: item } : item}
                  style={[
                    style,
                    {
                      width: '100%',
                      height: imageHeight || '100%',
                      
                    },
                  ]}
                />
              </Pressable>
              {showNumber ? (
                <View
                  style={{
                    position: 'absolute',
                    bottom: 40,
                    padding: 6,
                    borderRadius: 5,
                    right: 20,
                    backgroundColor: 'rgba(38, 38, 39, 0.76)',
                  }}
                >
                  <Text style={{ color: 'white' }}>{index + 1} / {images.length}</Text>
                </View>
              ) : (
                <View style={{ position: 'absolute', zIndex: 2, bottom: 5, width }}>
                  <ScrollView
                    style={{ flex: 1, flexDirection: 'row', gap: 2 }}
                    contentContainerStyle={{
                      flex: 1,
                      flexDirection: 'row',
                      gap: 2,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    horizontal
                    pagingEnabled
                  >
                    {Array.from({ length: images.length }, (_, indexs) => (
                      <MaterialCommunityIcons
                        key={indexs}
                        name="circle"
                        size={10 + Math.min(indexs - index, index - indexs) * 2}
                        color={indexs === index ? 'white' : 'rgb(245, 235, 235)'}
                      />
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
        />
      </View>
      {modal && showNumber && (
        <ImageModal
          images={images}
          setModalVisible={setShowImageModal}
          modalVisible={showImageModal}
          initialIndex={selectedImageIndex} // Pass the selected index
        />
      )}
    </>
  );
};

export default memo(ImageCarousel);

// import { MaterialCommunityIcons } from '@expo/vector-icons'
// import { Image, ImageStyle } from 'expo-image'
// import { router } from 'expo-router'
// import { memo, useState } from 'react'
// import { DimensionValue, FlatList, Pressable, ScrollView, Text, View } from 'react-native'
// import ImageModal from './ImageModal'

// interface CarouselProps {
//   images: string[],
//   width?: DimensionValue | undefined,
//   imageHeight?: DimensionValue | undefined,
//   showNumber?: boolean,
//   modal?: boolean
//   style?: ImageStyle
//   uri?: boolean
// }

// interface LinkProps {
//   href: string,
//   pathname: string
// }

// const ImageCarousel = ({imageHeight, width, images,showNumber,modal, style, uri} : CarouselProps) => {
//   const [showImageModal, setShowImageModal] = useState(false)
//   const scroll_route_func = (route:LinkProps, img_num: string, index:string) => {
//     if(index === img_num) {

//     }
//   }
//   // console.log('imaes', images)
//   return (<>
//     <View style={[ {borderTopRightRadius: 20, position: 'relative',}]}>
//               <FlatList
//                 scrollEventThrottle={16}
//                 data={images}
//                 renderItem={({item, index}) => (
//                   <View>
//                     <Pressable onPress={() => modal ?  setShowImageModal(true): router.push('/(guest)/(modals)/listing/[listing]')}>
//                       <Image
//                       //  source={item} 
//                       source={uri ?{uri: item} :item}
//                        style={[style, {
//                         width: width, 
//                         height:imageHeight || '100%',
//                         borderTopLeftRadius: showNumber ?40: 12,
//                         borderTopRightRadius: showNumber ?40: 12
//                       }]}
//                     />
//                     </Pressable>
//                     {showNumber ?(
//                       <View style={{position: 'absolute', bottom: 40, padding: 6, borderRadius: 5, right: 20,  backgroundColor: 'rgba(38, 38, 39, 0.76)'}}>
//                         <Text style={{color: 'white'}} > {index + 1} / {images.length } </Text>
//                       </View>
//                     ) : (
//                       <View style={{position: 'absolute', zIndex:2, bottom: 5, flex: 1, width}}>
                        
//                         <ScrollView style={{flex: 1,  flexDirection: 'row', gap: 2}}
//                           contentContainerStyle={{flex: 1,  flexDirection: 'row', gap: 2, alignItems:'center', justifyContent: 'center',}}
//                           horizontal
//                           pagingEnabled={true}
                          
//                         >
                          
//                             {Array.from(
//                               {length: images.length}, (_, indexs) => (
//                               <MaterialCommunityIcons key={indexs} name='circle' size={10 + Math.min(indexs - index, index - indexs) * 2} color={indexs === index ? 'white' : 'rgb(245, 235, 235)'}/>
                              
//                             )
//                             )}
//                         </ScrollView>
//                       </View>
//                     )
//                     }
//                   </View>
//                 )}
//                 // contentContainerStyle={{width}}
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 pagingEnabled
//               />
//     </View>
//     {modal && <ImageModal images={images} setModalVisible={setShowImageModal} modalVisible={showImageModal} />}
//   </>)
// }

// export default memo(ImageCarousel)

