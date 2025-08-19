const Listing=require("../models/listing");



module.exports.index=async (req,res)=>{
    const alllistings=await Listing.find({});
    res.render("index.ejs",{alllistings});
};


module.exports.renderNewForm=(req,res)=>{
    res.render("new.ejs");
};

module.exports.showListing=async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id).populate({path:"reviews",populate:{path:"author"},}).populate("owner");
    if(!listing){
      req.flash("error","Listing you requested for does not exist");
       res.redirect("/listing");
    }
    res.render("show.ejs",{listing});
};

module.exports.createListing=async (req,res,next) =>{
    let url=req.file.path;
    let filename=req.file.filename;
    
    let listings=new Listing(req.body.listings);
    listings.owner=req.user._id;
    listings.image={url,filename};
    await listings.save(); 
    req.flash("success","New Listing Created!.");
    res.redirect("/listing");
  };

  module.exports.renderEditForm=async (req,res)=>{
      let {id}=req.params;
      const listing=await Listing.findById(id);
      let originalImageUrl=listing.image.url;
      originalImageUrl=originalImageUrl.replace("/upload","/upload/w_250");
      res.render("edit.ejs",{listing,originalImageUrl});
  };

  module.exports.updateListing=async (req,res)=>{
     let {id}=req.params;
     let listing=await Listing.findByIdAndUpdate(id, { ...req.body.listings});
     if(typeof req.file !=="undefined"){
        let url=req.file.path;
        let filename=req.file.filename;
        listing.image={url,filename};
        await listing.save();
     } 
     req.flash("success","Updated Listing!.");
      res.redirect(`/listing/${id}`);
  };

  module.exports.deleteListing=async(req,res)=>{
      let {id}=req.params;
      let deleteListing=await Listing.findByIdAndDelete(id);
      req.flash("success"," Listing Deleted!.");
      res.redirect("/listing");
  };