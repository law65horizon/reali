import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import PreviousNextUI from '@/components/ui/PreviousNextUI'
import { useFormStore } from '@/stores/homeStore'
import { useTheme } from '@/theme/theme'
import { Entypo, MaterialCommunityIcons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { Dimensions, Modal, Pressable, TouchableOpacity, View } from 'react-native'

const {width, height} = Dimensions.get('screen')
interface props {
    uri: string,
    cover?: boolean
}
export interface imagesProps {
    uri: string,
    filename: string
}


// type mediaTypes = props[]

const Upload_media = () => {  
    const {theme} = useTheme()
    // const [images, setImages] = useState<{filename: string, uri: string}[]>([])
    const [modalVisible, setModalVisible] = useState(false)
    const {addImage, images: imgs, removeImage} = useFormStore()

    const handle_navigation = (direction: 'next'|'prev') => {
        if(direction === 'next') {
            router.push('/listing/homes/title_description')
        } else {
            router.push('/listing/homes/location')
        }
    }

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images', 'videos'],
            // allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
            allowsMultipleSelection: true,
            selectionLimit: 10
        })

        if (!result.canceled) {
            const uris = result.assets.map(asset => (
                {filename: asset.fileName!, uri: asset.uri}
            ))
            // console.log(result.assets[0])
            console.log(uris)
            // setImages({...images})
            // setImages([...images, uris])
            // addImage(uris)
            // setImages([...images, ...uris])
            addImage([...uris])
            console.log('kd', imgs)
            // setImages([...images, result.assets[0].uri])
        }
    }
  return (
    <ThemedView plain secondary style={{width, height, gap: 10, paddingVertical: 40, paddingHorizontal: 22, backgroundColor: theme.colors.background2}}> 
        <ThemedText type='subtitle'>Crerate a new Project</ThemedText>  
        <ThemedText secondary>Lorem ipsum dolor sit amet consectetur adipisicing elit. Cupiditate id eum, accusamus impedit exercitationem unde?</ThemedText>
        <View style={{gap: 10}}> 
            <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 5}}>
                {imgs.map((img, index) => (<View key={index} style={{width: 80}}>
                    <Image source={{uri: img.uri}} style={{width: 80, height: 80}} />
                    <Pressable onPress={() => {
                        // setImages(images.filter(uri => uri.uri != img.uri))
                        removeImage(img.filename)
                    }} style={{position: 'absolute', right: 0, top:0, zIndex: 2, backgroundColor: 'black'}}>
                        <Entypo name='cross' size={20} color={'white'} />
                    </Pressable>
                </View>))}
            </View>
            <TouchableOpacity onPress={() => setModalVisible(true)} style={{alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.tint, 
                opacity: 0.3, width: 80, height: 80, borderRadius: 10
            }}>
                <MaterialCommunityIcons name='camera' size={40} color={theme.colors.textSecondary} />
                <ThemedText type='defaultSemiBold' style={{color: theme.colors.textSecondary, fontSize: 13}} >Upload</ThemedText>
            </TouchableOpacity>
        </View>

        <Modal
         visible={modalVisible}
         onRequestClose={() => setModalVisible(false)}
         transparent={true}
        >
            <Pressable onPress={() => setModalVisible(false)} style={{flex: 1, }}>
                
            </Pressable>
            <View style={{width, height: 280, alignItems: 'center', gap: 5}}>
                <ThemedView plain style={{borderRadius: 10, width: '90%', backgroundColor: theme.colors.background}}>
                    <TouchableOpacity onPress={pickImage} style={{justifyContent:'center', alignItems: 'center', padding:20, borderBottomWidth: 0.9,borderColor:theme.colors.background2 }}>
                        <ThemedText>Camera</ThemedText>
                    </TouchableOpacity>
                    {/* <Line style={{borderBottomWidth: 0.2,}} /> */}
                    <TouchableOpacity style={{justifyContent:'center', alignItems: 'center', padding:20, borderBottomWidth: 0.9,borderColor:theme.colors.background2 }}>
                        <ThemedText>Photo Library</ThemedText>
                    </TouchableOpacity>
                    {/* <Line style={{borderBottomWidth: 0.2,}} /> */}
                    <TouchableOpacity style={{justifyContent:'center', alignItems: 'center', padding:20}}>
                        <ThemedText>Documents</ThemedText>
                    </TouchableOpacity>
                </ThemedView>
                <ThemedView plain style={{borderRadius: 10, width: '90%', backgroundColor: theme.colors.background}}>
                    <TouchableOpacity onPress={() => setModalVisible(false)} style={{justifyContent:'center', alignItems: 'center', padding:20}}>
                        <ThemedText>Cancel</ThemedText>
                    </TouchableOpacity>
                </ThemedView>
            </View>
        </Modal>

        <PreviousNextUI style={ {position: 'absolute', width, bottom: 100, zIndex: 1, }} prevFunc={() => handle_navigation('prev')} nextFunc={() => handle_navigation('next')}/>
    </ThemedView>

  ) 
}

export default Upload_media